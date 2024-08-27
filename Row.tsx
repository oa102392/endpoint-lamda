'use client'
export default function Row({ children, height}: { height: number, children: any }){
    return (
        <div className="w-11/12 mx-56 mt-8 flex place-items-center" style={{ height }}>
            { children }
        </div>
    )
}