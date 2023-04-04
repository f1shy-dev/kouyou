import React, { ReactElement, useState } from "react"
import { Button } from "./Button"
import Link from "next/link"

interface DropdownLink { text: string, href: string, nextLink: boolean }
interface DropdownButton { text: string, onClick: () => void, children?: ReactElement }

interface DropdownProps {
    linkItems?: (DropdownLink)[][]
    buttonItems?: (DropdownButton)[][]
    ddType: "link" | "button"
    open?: boolean
    setOpen?: (open: boolean) => void
    text?: string
    icon?: ReactElement<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string, titleId?: string } & React.RefAttributes<SVGSVGElement>>
    className?: string
    disabled?: boolean
    children?: ReactElement
}

export const Dropdown: React.FC<DropdownProps> = ({ ddType, linkItems, buttonItems, icon, className, disabled, text, children, open, setOpen }) => {
    const [ddOpen, setddOpen] = (open != undefined && setOpen != undefined) ? [open, setOpen] : useState(false);

    return (
        <div className="relative inline-block text-left">
            <Button className={`rounded-lg h-fit ${className}`} onClick={() => {
                setddOpen(!ddOpen);
            }} text={text} icon={icon} disabled={disabled}>
                {children}
            </Button>
            <div className={`${ddOpen ? 'absolute' : 'hidden'} right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-600 rounded-lg bg-material-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-white`} role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                {ddType == 'link' ? linkItems?.map((sections, sections_index) =>
                    <div className="py-1" role="none" key={sections_index}>
                        {sections.map((item, item_index) => (item.nextLink) ? <Link href={item.href} className="block px-4 py-2 text-sm" role="menuitem" key={item_index}>{item.text}</Link> : <a href={item.href} className="block px-4 py-2 text-sm" role="menuitem" key={item_index}>{item.text}</a>)}
                    </div>
                ) : buttonItems?.map((sections, sections_index) =>
                    <div className="py-1" role="none" key={sections_index}>
                        {sections.map((item, item_index) => <a onClick={item.onClick} className="block px-4 py-2 text-sm" key={item_index}>{item.text} {item.children}</a>)}
                    </div>
                )
                }
            </div>
        </div>
    )
}