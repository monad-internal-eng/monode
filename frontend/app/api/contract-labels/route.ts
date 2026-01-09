import { NextResponse } from 'next/server'
import { serverEnv } from '@/config/env'
import { getInvalidAddresses } from '@/lib/utils'
import type {
  BlockVisionContractDetailResponse,
  ContractLabel,
  ContractLabelsRequest,
  ContractLabelsResponse,
} from '@/types/contract'

const BLOCKVISION_API_BASE = 'https://api.blockvision.org/v2/monad'
const CACHE_TIME_SECONDS = 86400 // 1 day

export const revalidate = 86400 // 1 day

/**
 * Fetches contract detail from BlockVision API.
 */
async function fetchContractDetail(address: string): Promise<ContractLabel> {
  try {
    const apiKey = serverEnv.BLOCKVISION_API_KEY
    const response = await fetch(
      `${BLOCKVISION_API_BASE}/contract/detail?address=${address}`,
      {
        headers: {
          'x-api-key': apiKey,
        },
        next: {
          revalidate: CACHE_TIME_SECONDS,
        },
      },
    )

    if (!response.ok) {
      return { address, name: null, label: null }
    }

    const data = (await response.json()) as BlockVisionContractDetailResponse

    if (data.code !== 0 || !data.result) {
      return { address, name: null, label: null }
    }

    const { contractLabel, token } = data.result

    // Priority: contractLabel.name + contractLabel.label > token.name > null
    let name: string | null = null
    let label: string | null = null

    if (contractLabel?.name) {
      name = contractLabel.name
      label = contractLabel.label ?? null
    } else if (token?.name) {
      name = token.name
    }

    return { address, name, label }
  } catch {
    return { address, name: null, label: null }
  }
}

/**
 * POST /api/contract-labels
 *
 * Batch fetches contract labels for multiple addresses.
 * Results are cached at CDN/edge level for all users.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContractLabelsRequest
    const { addresses } = body

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'addresses array is required' },
        { status: 400 },
      )
    }

    // Validate all addresses are valid Ethereum addresses
    const invalidAddresses = getInvalidAddresses(addresses)
    if (invalidAddresses.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid address format',
          invalidAddresses,
        },
        { status: 400 },
      )
    }

    // Normalize to lowercase for consistent cache keys
    const normalizedAddresses = addresses.map((addr) => addr.toLowerCase())

    // Limit batch size to prevent abuse
    const MAX_BATCH_SIZE = 15
    const addressesToFetch = normalizedAddresses.slice(0, MAX_BATCH_SIZE)

    // Fetch all contract details in parallel
    const results = await Promise.all(
      addressesToFetch.map((address) => fetchContractDetail(address)),
    )

    // Build response map
    const labels: Record<string, ContractLabel> = {}
    for (const result of results) {
      labels[result.address] = result
    }

    const response: ContractLabelsResponse = { labels }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TIME_SECONDS}, s-maxage=${CACHE_TIME_SECONDS}`,
        'CDN-Cache-Control': `public, max-age=${CACHE_TIME_SECONDS}, s-maxage=${CACHE_TIME_SECONDS}`,
        'Vercel-CDN-Cache-Control': `public, max-age=${CACHE_TIME_SECONDS}, s-maxage=${CACHE_TIME_SECONDS}`,
      },
    })
  } catch (error) {
    console.error('Error fetching contract labels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contract labels' },
      { status: 500 },
    )
  }
}
