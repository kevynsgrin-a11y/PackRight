import React from 'react'
import { Backpack, ShieldAlert, GripVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'

interface Item {
  id: string
  name: string
  weight: number
  tsa: 'safe' | 'checked_only' | 'prohibited'
}

interface Bins {
  personal: { items: Item[] }
  carry_on: { items: Item[] }
  checked: { items: Item[] }
}

interface Props {
  result: any
  bins: Bins
  onDragEnd: (result: DropResult) => void
}

export default function KnapsackAllocator({ result, bins, onDragEnd }: Props) {
  if (!result) return null;

  return (
    <div className="glass-panel p-6 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-premium-700 rounded-lg">
          <Backpack className="w-5 h-5 text-accent-secondary" />
        </div>
        <h2 className="text-xl font-semibold">Smart Packing Allocator</h2>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {Object.entries(bins).map(([binId, binData]) => {
            const totalWeight = binData.items.reduce((sum, item) => sum + item.weight, 0);
            
            return (
              <Droppable key={binId} droppableId={binId}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-premium-900/50 rounded-xl p-4 border border-dashed transition-colors min-h-[200px] flex flex-col
                      ${snapshot.isDraggingOver ? 'border-accent-secondary bg-premium-800/80' : 'border-white/10'}
                    `}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-sm text-text-muted capitalize">
                        {binId.replace('_', ' ')}
                      </h3>
                      <span className="text-xs text-text-muted">{totalWeight} lbs</span>
                    </div>

                    <div className="space-y-2 flex-grow">
                      {binData.items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-premium-800 rounded-lg p-3 text-sm shadow-sm border border-white/5 flex items-center justify-between
                                ${snapshot.isDragging ? 'ring-2 ring-accent-primary shadow-xl opacity-90' : ''}
                                ${item.tsa === 'checked_only' && binId !== 'checked' ? 'bg-red-500/10 border-red-500/30' : ''}
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps} className="text-text-muted hover:text-white cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <span className={item.tsa === 'checked_only' && binId !== 'checked' ? 'text-red-200' : 'text-white'}>
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-xs text-text-muted">{item.weight}lbs</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Empty state hint */}
                      {binData.items.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-xs text-center mt-8 text-text-muted opacity-50">
                          Drag items here
                        </div>
                      )}
                    </div>
                    
                    {/* Validation Warnings */}
                    {binData.items.some(i => i.tsa === 'checked_only') && binId !== 'checked' && (
                      <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-xs flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-red-200">Contains items that must be checked (e.g. Liquids &gt; 3.4oz)</span>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            );
          })}

        </div>
      </DragDropContext>
    </div>
  )
}
