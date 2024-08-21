import type { NextApiRequest, NextApiResponse } from 'next'


type ResponseData = {
    table: {headers: string[], data: any[][] },
    quarters: {labels: string[], data: number[] },
    bars: {categories: string[], data: number[] },
    pie: {colors: string[], data: { value: number, label: string}[] }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
){
    res.status(200).json({
        table: {
            headers: ['Desert (110g serving)', 'calories', 'fat', 'carbs', 'protein'],
            data: [
                ['Frozen yoghurt', 159, 6.0, 24, 4.0],
            ]
        },
        quarters:{
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            data: [
                { data: [35, 44, 24, 34]},
                { data: [35, 44, 24, 34]},
                { data: [35, 44, 24, 34]},
                { data: [35, 44, 24, 34]},
            ]
        },
        bars: {
            categories: ['bar A', 'bar B', 'bar C'],
            data: [2, 5, 3]
        },
        pie: {
            colors: ['red', 'blue', 'green'],
            data: [
                { value: 10, label: "Oranges"},
                { value: 5, label: "Bananas"},
                { value: 2, label: "Apples"},
            ]
        }
    })
}