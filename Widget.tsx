'use client'
export default function Widget({ title, children, width }: { title: string, children:any, width: number }) {
    return (
        <div className="border border-slate-400 mx-1 bg-slate-50" style={{ height: "100%", width}}>
            <div className="bg-gray-500 pl-1">{ title }</div>
            <div style={{ width: "100%", height: "100%"}}> { children } </div>
        </div>
    )
}


