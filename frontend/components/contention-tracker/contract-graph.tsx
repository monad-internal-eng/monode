'use client'

import { useMemo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useContractLabels } from '@/hooks/use-contract-labels'
import { shortenHex } from '@/lib/utils'
import type {
  ContractContentionEntry,
  ContractEdge,
} from '@/types/contention'

interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  radius: number
  contentionScore: number
  contendedSlots: number
  totalSlots: number
  totalAccesses: number
}

interface GraphLink {
  source: string
  target: string
  weight: number
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
}

interface ContractGraphProps {
  contracts: ContractContentionEntry[]
  edges: ContractEdge[]
}

const GRAPH_WIDTH = 600
const GRAPH_HEIGHT = 400
const CENTER_X = GRAPH_WIDTH / 2
const CENTER_Y = GRAPH_HEIGHT / 2
const RADIUS = 150
const MIN_NODE_RADIUS = 16
const MAX_NODE_RADIUS = 40

/**
 * Circular graph visualization showing contract dependency relationships.
 * Nodes represent contracts with contention, sized by contention severity.
 * Edges show contracts co-accessed within the same transactions.
 */
export function ContractGraph({ contracts, edges }: ContractGraphProps) {
  const addresses = useMemo(
    () => contracts.map((c) => c.address),
    [contracts],
  )
  const { getLabel } = useContractLabels(addresses)

  const { nodes, links } = useMemo(() => {
    if (contracts.length === 0) return { nodes: [], links: [] }

    const maxContended = Math.max(
      ...contracts.map((c) => c.contended_slots),
      1,
    )

    // Arrange nodes in a circle
    const graphNodes: GraphNode[] = contracts.map((contract, i) => {
      const angle =
        (2 * Math.PI * i) / contracts.length - Math.PI / 2
      const nodeRadius =
        MIN_NODE_RADIUS +
        (contract.contended_slots / maxContended) *
          (MAX_NODE_RADIUS - MIN_NODE_RADIUS)

      return {
        id: contract.address,
        label: shortenHex(contract.address),
        x: CENTER_X + RADIUS * Math.cos(angle),
        y: CENTER_Y + RADIUS * Math.sin(angle),
        radius: nodeRadius,
        contentionScore: contract.contention_score,
        contendedSlots: contract.contended_slots,
        totalSlots: contract.total_slots,
        totalAccesses: contract.total_accesses,
      }
    })

    const nodeMap = new Map(graphNodes.map((n) => [n.id, n]))

    const graphLinks: GraphLink[] = edges
      .filter((e) => nodeMap.has(e.contract_a) && nodeMap.has(e.contract_b))
      .map((edge) => {
        const source = nodeMap.get(edge.contract_a)!
        const target = nodeMap.get(edge.contract_b)!
        return {
          source: edge.contract_a,
          target: edge.contract_b,
          weight: edge.shared_txn_count,
          sourceX: source.x,
          sourceY: source.y,
          targetX: target.x,
          targetY: target.y,
        }
      })

    return { nodes: graphNodes, links: graphLinks }
  }, [contracts, edges])

  const maxWeight = useMemo(
    () => Math.max(...links.map((l) => l.weight), 1),
    [links],
  )

  if (nodes.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center text-zinc-500 text-sm">
        No contract contention detected in current block.
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
        className="w-full h-auto max-h-96"
      >
        {/* Edges */}
        {links.map((link) => {
          const opacity = 0.2 + (link.weight / maxWeight) * 0.6
          const strokeWidth = 1 + (link.weight / maxWeight) * 3

          // Curved edge through center offset
          const midX = (link.sourceX + link.targetX) / 2
          const midY = (link.sourceY + link.targetY) / 2
          const dx = midX - CENTER_X
          const dy = midY - CENTER_Y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const curveOffset = 30
          const cx = midX - (dx / dist) * curveOffset
          const cy = midY - (dy / dist) * curveOffset

          return (
            <path
              key={`${link.source}-${link.target}`}
              d={`M ${link.sourceX} ${link.sourceY} Q ${cx} ${cy} ${link.targetX} ${link.targetY}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={strokeWidth}
              opacity={opacity}
              className="transition-opacity duration-300"
            />
          )
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const label = getLabel(node.id)
          const displayName = label?.displayName ?? node.label
          const hue = node.contentionScore * 30 // 0=amber, high=red
          const fillColor =
            node.contentionScore > 0.5
              ? `hsl(${Math.max(0, 30 - hue)}, 90%, 45%)`
              : `hsl(${Math.max(0, 40 - hue)}, 80%, 50%)`

          return (
            <Tooltip key={node.id}>
              <TooltipTrigger asChild>
                <g className="cursor-pointer group">
                  {/* Glow */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + 4}
                    fill="none"
                    stroke={fillColor}
                    strokeWidth={1}
                    opacity={0.3}
                    className="transition-all duration-300 group-hover:opacity-60"
                  />
                  {/* Main circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={fillColor}
                    opacity={0.85}
                    className="transition-all duration-300 group-hover:opacity-100"
                  />
                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    className="fill-white text-[9px] font-mono pointer-events-none"
                  >
                    {displayName.length > 8
                      ? displayName.slice(0, 8)
                      : displayName}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 10}
                    textAnchor="middle"
                    className="fill-white/80 text-[8px] font-mono pointer-events-none"
                  >
                    {node.contendedSlots} slots
                  </text>
                </g>
              </TooltipTrigger>
              <TooltipContent
                sideOffset={5}
                className="w-[15rem] rounded-lg border border-tooltip-border bg-tooltip-bg p-3 text-sm shadow-xl"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-sm uppercase tracking-wider text-tooltip-text-accent">
                    {displayName}
                  </span>
                  <p className="break-all font-mono text-2xs text-tooltip-text-secondary">
                    {node.id}
                  </p>
                  <div className="my-1 border-t border-tooltip-separator" />
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-tooltip-text-secondary">
                        Contended slots
                      </span>
                      <span className="text-xs font-medium text-white">
                        {node.contendedSlots} / {node.totalSlots}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-tooltip-text-secondary">
                        Contention score
                      </span>
                      <span className="text-xs font-medium text-white">
                        {(node.contentionScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-tooltip-text-secondary">
                        Total accesses
                      </span>
                      <span className="text-xs font-medium text-white">
                        {node.totalAccesses.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </svg>
    </div>
  )
}
