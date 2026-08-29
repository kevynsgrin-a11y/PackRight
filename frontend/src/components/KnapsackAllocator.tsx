import { useId, useLayoutEffect, useState } from 'react'
import { Backpack, ShieldAlert } from 'lucide-react'
import type { BagType } from '../lib/api'
import { BIN_LABELS, BIN_ORDER, binTotalWeight } from '../lib/bins'
import type { BinDimensions, Bins } from '../lib/bins'

interface Props {
  bins: Bins
  onMoveItem: (itemId: string, from: BagType, to: BagType) => void
  onDimensionChange: (bin: BagType, axis: keyof BinDimensions, value: number | null) => void
  onEmptyWeightChange: (bin: BagType, value: number | null) => void
  /**
   * The airline's published allowance for each bag, already formatted.
   * Checked bags are limited by a linear total rather than three sides, so this
   * is a string per bag rather than a set of dimensions.
   */
  allowanceLabels: Partial<Record<BagType, string | null>>
}

/**
 * Moving items between bags.
 *
 * Audit issue P1-12: the previous implementation used drag handles that were
 * focusable role="button" elements with no accessible name, and offered no
 * keyboard path at all. Every item now has a labelled "Move to" control that
 * works with a keyboard, a screen reader and touch. Pointer drag-and-drop is
 * kept as an enhancement using native HTML drag events, which also removed a
 * ~100 KB drag-and-drop dependency from the startup bundle (P1-14).
 */
export default function KnapsackAllocator({
  bins,
  onMoveItem,
  onDimensionChange,
  onEmptyWeightChange,
  allowanceLabels,
}: Props) {
  const baseId = useId()
  const [dragging, setDragging] = useState<{ itemId: string; from: BagType } | null>(null)
  const [dragOver, setDragOver] = useState<BagType | null>(null)

  // The destination each item's select is currently *pointing at*, which is not
  // the same as where it has been moved. Committing on change violated WCAG
  // 3.2.2: arrowing through a native select fires change on every option, so a
  // keyboard user could not read the choices without executing each one.
  const [targets, setTargets] = useState<Record<string, BagType>>({})
  const [focusItemId, setFocusItemId] = useState<string | null>(null)

  // A move unmounts the item's <li> from one column and mounts a new one in
  // another, so activeElement falls back to <body> and the keyboard user loses
  // their place entirely. The select id is stable across bins, so the
  // equivalent control in the destination can be found and focused once the
  // new bins have rendered.
  useLayoutEffect(() => {
    if (!focusItemId) return
    document.getElementById(`${baseId}-move-${focusItemId}`)?.focus()
    setFocusItemId(null)
  }, [bins, focusItemId, baseId])

  const commitMove = (itemId: string, from: BagType) => {
    const to = targets[itemId] ?? from
    if (to === from) return
    setTargets((current) => {
      const next = { ...current }
      delete next[itemId]
      return next
    })
    setFocusItemId(itemId)
    onMoveItem(itemId, from, to)
  }

  const handleDrop = (to: BagType) => {
    if (dragging && dragging.from !== to) onMoveItem(dragging.itemId, dragging.from, to)
    setDragging(null)
    setDragOver(null)
  }

  return (
    <section className="glass-panel p-6" aria-labelledby={`${baseId}-heading`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="p-2 bg-premium-700 rounded-lg">
          <Backpack className="w-5 h-5 text-accent-secondary" aria-hidden="true" />
        </span>
        <h2 id={`${baseId}-heading`} className="text-xl font-semibold">
          Smart Packing Allocator
        </h2>
      </div>
      <p className="text-sm text-text-muted mb-6">
        Move items between bags to see how the estimate changes. Drag with a mouse, or use each
        item&rsquo;s <span className="text-white">Move to</span> control and its{' '}
        <span className="text-white">Move</span> button. Add your bag&rsquo;s measurements to check
        it against the airline allowance.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BIN_ORDER.map((binId) => {
          const bin = bins[binId]
          const allowanceText = allowanceLabels[binId]
          const total = binTotalWeight(bin)
          const hasMisplacedItem = bin.items.some((i) => i.tsa === 'checked_only') && binId !== 'checked'

          return (
            <div
              key={binId}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(binId)
              }}
              onDragLeave={() => setDragOver((current) => (current === binId ? null : current))}
              onDrop={(e) => {
                e.preventDefault()
                handleDrop(binId)
              }}
              className={`bg-premium-900/50 rounded-xl p-4 border border-dashed transition-colors flex flex-col ${
                dragOver === binId ? 'border-accent-secondary bg-premium-800/80' : 'border-white/10'
              }`}
            >
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-medium text-sm text-white">{BIN_LABELS[binId]}</h3>
                <span className="text-xs text-text-muted">{total} lb</span>
              </div>
              <p className="text-xs text-text-muted mb-3">
                {allowanceText ? `Allowance ${allowanceText}` : 'Allowance not published'}
              </p>

              <ul className="space-y-2 grow list-none" aria-label={`Items in your ${BIN_LABELS[binId].toLowerCase()}`}>
                {bin.items.map((item) => {
                  const misplaced = item.tsa === 'checked_only' && binId !== 'checked'
                  const selectId = `${baseId}-move-${item.id}`
                  const target = targets[item.id] ?? binId
                  return (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={() => setDragging({ itemId: item.id, from: binId })}
                      onDragEnd={() => {
                        setDragging(null)
                        setDragOver(null)
                      }}
                      className={`bg-premium-800 rounded-lg p-3 text-sm shadow-sm border transition-shadow ${
                        misplaced ? 'bg-red-500/10 border-red-500/30' : 'border-white/5'
                      } ${dragging?.itemId === item.id ? 'ring-2 ring-accent-primary opacity-90' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={misplaced ? 'text-red-200' : 'text-white'}>{item.name}</span>
                        <span className="text-xs text-text-muted shrink-0">{item.weight} lb</span>
                      </div>

                      <label htmlFor={selectId} className="sr-only">
                        Move {item.spokenName} to another bag
                      </label>
                      <div className="flex gap-2">
                        <select
                          id={selectId}
                          value={target}
                          onChange={(e) =>
                            setTargets((current) => ({
                              ...current,
                              [item.id]: e.target.value as BagType,
                            }))
                          }
                          className="min-w-0 grow bg-premium-900 border border-white/25 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                        >
                          {BIN_ORDER.map((option) => (
                            <option key={option} value={option}>
                              {option === binId
                                ? `In ${BIN_LABELS[option].toLowerCase()}`
                                : `Move to ${BIN_LABELS[option].toLowerCase()}`}
                            </option>
                          ))}
                        </select>
                        {/*
                          aria-disabled rather than disabled. A disabled button
                          is removed from the tab order, so a screen-reader user
                          tabbing through would never learn the Move button
                          exists until after changing the select -- and the
                          select is exactly where they would have expected the
                          move to happen. Kept focusable and announced; the
                          click is a no-op because commitMove returns early when
                          the destination is the current bag.
                        */}
                        <button
                          type="button"
                          aria-disabled={target === binId}
                          onClick={() => commitMove(item.id, binId)}
                          className={`shrink-0 bg-premium-700 border border-white/25 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
                            target === binId ? 'cursor-not-allowed text-white/70' : 'hover:bg-premium-600'
                          }`}
                        >
                          Move
                          <span className="sr-only">
                            {' '}
                            {item.spokenName}
                            {target === binId
                              ? ' — choose a destination first'
                              : ` to ${BIN_LABELS[target].toLowerCase()}`}
                          </span>
                        </button>
                      </div>
                    </li>
                  )
                })}

                {bin.items.length === 0 ? (
                  <li className="text-xs text-center py-6 text-text-muted">
                    No items in this bag
                  </li>
                ) : null}
              </ul>

              {hasMisplacedItem ? (
                <p className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                  <span className="text-red-200">
                    This bag holds something PackRight flags as checked-bag only, based on the
                    example items loaded above rather than on a screening decision. Rules change and
                    screening officers have the final say, so check the{' '}
                    <a
                      href="https://www.tsa.gov/travel/security-screening/whatcanibring"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="underline underline-offset-2 hover:text-white"
                    >
                      TSA&rsquo;s own What Can I Bring list
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>{' '}
                    before you pack.
                  </span>
                </p>
              ) : null}

              <fieldset className="mt-4 border-t border-white/5 pt-3">
                <legend className="text-xs text-text-muted mb-2">
                  {BIN_LABELS[binId]} measurements (inches)
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {(['length', 'width', 'height'] as const).map((axis) => {
                    const inputId = `${baseId}-${binId}-${axis}`
                    return (
                      <div key={axis}>
                        <label htmlFor={inputId} className="block text-[11px] text-text-muted mb-1 capitalize">
                          {axis}
                        </label>
                        <input
                          id={inputId}
                          name={`${binId}-${axis}`}
                          type="number"
                          inputMode="decimal"
                          min={1}
                          max={120}
                          step={0.5}
                          placeholder="--"
                          value={bin.dimensions[axis] ?? ''}
                          onChange={(e) =>
                            onDimensionChange(binId, axis, e.target.value === '' ? null : Number(e.target.value))
                          }
                          className="w-full bg-premium-900 border border-white/25 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="mt-2">
                  <label
                    htmlFor={`${baseId}-${binId}-empty-weight`}
                    className="block text-[11px] text-text-muted mb-1"
                  >
                    Empty bag weight (lb)
                  </label>
                  <input
                    id={`${baseId}-${binId}-empty-weight`}
                    name={`${binId}-empty-weight`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step={0.5}
                    placeholder="0"
                    value={bin.emptyWeight ?? ''}
                    onChange={(e) =>
                      onEmptyWeightChange(binId, e.target.value === '' ? null : Number(e.target.value))
                    }
                    className="w-full bg-premium-900 border border-white/25 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                  />
                </div>
              </fieldset>
            </div>
          )
        })}
      </div>
    </section>
  )
}
