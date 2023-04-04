import React, { ReactElement, useState } from "react"
import { Button } from "./Button"
import Link from "next/link"
import { Dropdown } from "./Dropdown"

interface SelectionItem { text: string, value: any }

interface DropdownSelectionProps {
    items: (SelectionItem)[][]
    onChange?: (item: SelectionItem) => void

    // button props
    defaultItem: SelectionItem
    icon?: ReactElement<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string, titleId?: string } & React.RefAttributes<SVGSVGElement>>
    className?: string
    disabled?: boolean
    children?: ReactElement
}

export const DropdownSelection: React.FC<DropdownSelectionProps> = ({ items, icon, className, disabled, defaultItem, children, onChange }) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(defaultItem);


    return (
        <Dropdown ddType="button" buttonItems={items.map((s) => s.map(i => ({
            text: i.text,
            onClick: () => {
                setSelected(i)
                setOpen(false)
                onChange?.(i)
            }
        })))} text={selected.text}
            icon={icon} className={className} disabled={disabled}
            open={open} setOpen={setOpen} children={children}
        />
    )
}