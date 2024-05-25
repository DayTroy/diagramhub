"use client";

import { Color } from "@/types/canvas";

/**
 * The props type for {@link ColorPicker}
 */
export interface GatewayPickerProps {
    onChange: (logicalType: string) => void;
}

/**
 *  Component representing a color picker
 *  @category Component
 */
export const GatewayPicker = ({
  onChange
}: GatewayPickerProps) => {
  return (
    <div
      className="flex flex-wrap gap-2 items-center max-w-[164px] pr-2 mr-2 border-r border-neutral-200"
    >
      <GatewayButton logicalType="AND" onClick={onChange} typeLabel="+"/>
      <GatewayButton logicalType="OR" onClick={onChange} typeLabel="X"/>
      <GatewayButton logicalType="XOR" onClick={onChange} typeLabel="O"/>
    </div>
  )
}

/**
 * The props type for {@link GatewayPickerProps}
 */
export interface GatewayButtonProps {
  onClick: (logicalType: string) => void;
  logicalType: string;
  typeLabel: string;
}

/**
 *  Component representing a color button
 *  @category Component
 */
export const GatewayButton = ({
  logicalType,
  onClick,
  typeLabel
}: GatewayButtonProps) => {
  return (
    <button
      className="w-8 h-8 items-center flex justify-center hover:opacity-75 transition"
      onClick={() => onClick(logicalType)}
    >
      <div 
        className="h-8 w-8 rounded-md border border-neutral-300"
        style={{backgroundColor: "#acacac"}}
      >
        {typeLabel}
      </div>
      </button>
  )
}