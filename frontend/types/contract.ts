/**
 * Contract label information returned from the API.
 */
export interface ContractLabel {
  address: string
  name: string | null
  label: string | null
}

/**
 * BlockVision API response for contract detail.
 */
export interface BlockVisionContractDetailResponse {
  code: number
  reason?: string
  message: string
  result?: {
    creator?: string
    creationTx?: string
    createdTime?: string
    verifyStatus?: string
    contractMeta?: {
      isSourceCodeVerified?: boolean
      isProxyContract?: boolean
      implementationAddress?: string
      ImplementationContractName?: string
      contractName?: string
      verified?: boolean
    }
    token?: {
      name?: string
      image?: string
      symbol?: string
      scamFlag?: boolean
    }
    contractLabel?: {
      address?: string
      name?: string
      label?: string
      logo?: string
      scamFlag?: boolean
      isVerified?: boolean
    }
  }
}

/**
 * Request body for batch contract labels API.
 */
export interface ContractLabelsRequest {
  addresses: string[]
}

/**
 * Response from batch contract labels API.
 */
export interface ContractLabelsResponse {
  labels: Record<string, ContractLabel>
}
