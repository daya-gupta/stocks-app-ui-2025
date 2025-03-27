'use client';
import { useEffect, useState } from "react";
import { FaChartLine } from "react-icons/fa6";
import Link from "next/link";
import moment from "moment";
import { GLOBAL_LIST } from "./utils/constants";
import { CandleType } from "./utils/types";

const baseUrl = 'http://localhost:3000';

const defaultAverageReturns = {
    dayChange1: 0,
    weekChange1: 0,
    weekChange2: 0,
    monthChange1: 0,
    monthChange3: 0,
    monthChange6: 0,
    yearChange1: 0,
};

const instruments = [
    "NSE_EQ%7CINE848E01016",
    "NSE_EQ%7CINE752E01010",
    "NSE_EQ%7CINE251B01027",
    "NSE_EQ%7CINE613B01010",
    "NSE_EQ%7CINE138Y01010",
    "NSE_EQ%7CINE596I01012",
    "NSE_EQ%7CINE457L01029",
    "NSE_EQ%7CINE481N01025", //home first
    "NSE_EQ%7CINE542W01025",
    "NSE_EQ%7CINE00VM01036",
    "NSE_EQ%7CINE200M01039", //VBL
    "NSE_EQ%7CINE04I401011", //KPIT
    "NSE_EQ%7CINE475E01026", //caplin-point
    "BSE_EQ%7CINE024F01011", //shilchar
    "NSE_EQ%7CINE731H01025", //ACE
    "NSE_EQ%7CINE07K301024", //Zaggle
    "BSE_EQ%7CINE015C01016", //Tinna Rubber
    "NSE_EQ%7CINE00F201020", //prudent
    "NSE_EQ%7CINE439E01022", //skipper
    "NSE_EQ%7CINE01IU01018", //sky gold
    // "NSE_EQ%7CINE953R01016", //png jewellers
    "NSE_EQ%7CINE463V01026", // anand rathi
    "NSE_EQ%7CINE043W01024", //vijaya diagnostics
    "NSE_EQ%7CINE152M01016", // triveni turbine

    "NSE_INDEX%7CNifty%2050",
    // "NSE_INDEX%7CNifty%20Smallcap%20250",
    // "NSE_INDEX%7CINEB000B0Z12",
];

interface CandleResponseType {
    instrument: string;
    candles: [CandleType];
}

interface FormattedCandleType {
    instrument: string;
    name: string;
    price: number;
    dayChange1: number;
    weekChange1: number;
    weekChange2: number;
    monthChange1: number;
    monthChange3: number,
    monthChange6: number,
    yearChange1: number,
}

type averageReturnType = {
    dayChange1: number;
    weekChange1: number;
    weekChange2: number;
    monthChange1: number;
    monthChange3: number,
    monthChange6: number,
    yearChange1: number,
};

const getIndex = (data: [CandleType], quantity: number, unit: string) => {
    const currentDate = moment(data[0][0]);
    // @ts-expect-error error from moment library
    const date = currentDate.subtract(quantity, unit).format('YYYY-MM-DD');
    const index = data.findIndex((data) => data[0].split('T')[0] <= date);
    return index;
}

const formatData = (dData: [CandleResponseType], iData: [CandleResponseType]): {formattedData: FormattedCandleType[], averageReturns: averageReturnType, benchmarkData: FormattedCandleType[]} => {
    const formattedData: FormattedCandleType[] = [];
    dData.forEach((item, index) => {
        const instrumentDetails = GLOBAL_LIST[item.instrument] || {};
        const name = instrumentDetails.name || item.instrument;
        // consider intraday data only when same date does not exist within delivery data
        // TBD - handle weekly data
        if (dData[index].candles.length && iData[index].candles.length && dData[index].candles[0][0].split('T')[0] !== iData[index].candles[0][0].split('T')[0]) {
            item.candles.unshift(iData[index].candles[0]);
        }
        console.log('array data', item.candles.slice(0, 3));
        const price = item.candles[0][4];
        // const lastPrice = item.candles[1][4];
        const lastPrice = item.candles[getIndex(item.candles, 1, 'day')][4];
        const weekPrice1 = item.candles[getIndex(item.candles, 1, 'weeks')][4];
        const weekPrice2 = item.candles[getIndex(item.candles, 2, 'weeks')][4];
        const monthPrice1 = item.candles[getIndex(item.candles, 1, 'months')][4];
        const monthPrice3 = item.candles[getIndex(item.candles, 3, 'months')]?.[4];
        const monthPrice6 = item.candles[getIndex(item.candles, 6, 'months')]?.[4];
        const yearPrice1 = item.candles[getIndex(item.candles, 1, 'year')]?.[4];

        formattedData.push({
            instrument: item.instrument,
            name,
            price,
            dayChange1: +((price - lastPrice) / lastPrice * 100).toFixed(1),
            weekChange1: +((price - weekPrice1) / weekPrice1 * 100).toFixed(1),
            weekChange2: +((price - weekPrice2) / weekPrice2 * 100).toFixed(1),
            monthChange1: +((price - monthPrice1) / monthPrice1 * 100).toFixed(1),
            monthChange3: +((price - monthPrice3) / monthPrice3 * 100).toFixed(1),
            monthChange6: +((price - monthPrice6) / monthPrice6 * 100).toFixed(1),
            yearChange1: +((price - yearPrice1) / monthPrice1 * 100).toFixed(1),
        });
    });
    const benchmarkData: FormattedCandleType[] = [];
    const niftyData = formattedData.pop();
    if (niftyData) {
        benchmarkData.push(niftyData)
    }
    // compute average returns
    const toalReturns = {
        dayChange1: 0,
        weekChange1: 0,
        weekChange2: 0,
        monthChange1: 0,
        monthChange3: 0,
        monthChange6: 0,
        yearChange1: 0,
    };
    const averageReturns = { ...defaultAverageReturns };
    formattedData.forEach((item) => {
        toalReturns.dayChange1 = toalReturns.dayChange1 + Number(item.dayChange1);
        toalReturns.weekChange1 = toalReturns.weekChange1 + Number(item.weekChange1);
        toalReturns.weekChange2 = toalReturns.weekChange2 + Number(item.weekChange2);
        toalReturns.monthChange1 = toalReturns.monthChange1 + Number(item.monthChange1);
        toalReturns.monthChange3 = toalReturns.monthChange3 + Number(item.monthChange3) || 0;
        toalReturns.monthChange6 = toalReturns.monthChange6 + Number(item.monthChange6) || 0;
        toalReturns.yearChange1 = toalReturns.yearChange1 + Number(item.yearChange1) || 0;
    });
    averageReturns.dayChange1 = +(toalReturns.dayChange1 / formattedData.length).toFixed(1);
    averageReturns.weekChange1 = +(toalReturns.weekChange1 / formattedData.length).toFixed(1);
    averageReturns.weekChange2 = +(toalReturns.weekChange2 / formattedData.length).toFixed(1);
    averageReturns.monthChange1 = +(toalReturns.monthChange1 / formattedData.length).toFixed(1);
    averageReturns.monthChange3 = +(toalReturns.monthChange3 / formattedData.length).toFixed(1);
    averageReturns.monthChange6 = +(toalReturns.monthChange6 / formattedData.length).toFixed(1);
    averageReturns.yearChange1 = +(toalReturns.yearChange1 / formattedData.length).toFixed(1);
    return { formattedData, averageReturns, benchmarkData };
}

// const formatIntradayData = (data) => {
//     const formattedData = [];
//     data.forEach((item) => {
//         const instrumentDetails = GLOBAL_LIST[item.instrument] || {};
//         const name = instrumentDetails.name || item.instrument;
//         const price = item.candles[0][4];
//         formattedData.push({
//             instrument: item.instrument,
//             name,
//             price,
//         });
//     });
//     return [formattedData];
// }

const Portfolio = () => {
    const [data, setData] = useState<Array<FormattedCandleType>>([]);
    const [averageReturns, setAverageReturns] = useState<averageReturnType>({...defaultAverageReturns});
    const [indexReturns, setIndexReturns] = useState<FormattedCandleType[]>([]);

    const fetchData = () => {
        const deliveryPayload = {
            filter: {
                instruments,
                interval: 'day',
                from_date: '2024-03-01',
                // "to_date": "2025-03-06"
                to_date: new Date().toISOString().split('T')[0]
            }
        }
        const intradayPayload = {
            filter: {
                instruments,
                interval: '30minute',
            }
        }
        const promiseArray = [];
        const deliveryReq = fetch(`${baseUrl}/historicalDataUpstox`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deliveryPayload)
        });
        promiseArray.push(deliveryReq);

        const intradayReq = fetch(`${baseUrl}/intradayData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(intradayPayload)
        });
        promiseArray.push(intradayReq);

        Promise.all(promiseArray)
            // .then(response => response.json())
            .then((response) => {
                return Promise.all(response.map((res) => res.json()));
            })
            .then(([deliveryData, intradayData]) => {
                const { formattedData, averageReturns, benchmarkData } = formatData(deliveryData, intradayData);
                // const formattedIntradayData = formatIntradayData(intradayData);
                // fetchIntradayData(instruments, '30minute');                
                setData(formattedData);
                setAverageReturns(averageReturns);
                setIndexReturns(benchmarkData);
            })
            .catch(error => console.error(error));
    }

    // const fetchIntradayData = (instruments, interval) => {
    //     const payload = {
    //         "filter": {
    //             instruments,
    //             interval,
    //         }
    //     }
    //     fetch(`${baseUrl}/intradayData`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(payload)
    //     })
    //         .then(response => response.json())
    //         .then(data => {
    //             const formattedData = [];
    //             data.forEach((item) => {
    //                 const instrumentDetails = GLOBAL_LIST[item.instrument] || {};
    //                 const name = instrumentDetails.name || item.instrument;
    //                 const price = item.candles[0][4];
    //                 formattedData.push({
    //                     instrument: item.instrument,
    //                     name,
    //                     price,
    //                 });
    //             })
    //             return [formattedData];
    //         })
    //         .catch(error => console.error(error));
    // }

    useEffect(() => {
        fetchData();
        return () => {
            console.log('unmounting');
        }
    }, []);

    const getReturnStyles = (value: number) => {
        // tbd assign color codes based on relative values
        const colorCodes = [0, .1, .3, .5, .7];
        const color = value > 0 ? '0, 255, 0' : '255, 0, 0';
        const absValue = Math.ceil(Math.abs(value));
        let code;
        switch(absValue) {
            case 0: code = 0; break;
            case 1: code = 1; break;
            case 2: code = 2; break;
            case 3: code = 3; break;
            default: code = 4 
        }
        console.log(value, code);
        return { backgroundColor: `rgba(${color},${colorCodes[code]})` }
    }
    return (
        <div>
            <h1>Model Portfolio - Growth 30</h1>
            <br />
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th className="numeric">Price</th>
                        <th className="numeric">1 Day</th>
                        <th className="numeric">1 Week</th>
                        <th className="numeric">2 Week</th>
                        <th className="numeric">1 Month</th>
                        <th className="numeric">3 Month</th>
                        <th className="numeric">6 Month</th>
                        <th className="numeric">1 Year</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => {
                        return (
                            <tr key={index}>
                                <td>
                                    {item.name}
                                    {/* <button onClick={() => openChart(item.instrument)}>Chart</button> */}
                                    <Link className="pull-right" href={`/chart/${item.instrument}`}>
                                        <FaChartLine title="Open Chart" />
                                    </Link>
                                    {/* <button onClick={() => fetchIntradayData([item.instrument], '30minute')}>Intraday</button> */}
                                </td>
                                <td className="numeric">{item.price}</td>
                                <td style={getReturnStyles(item.dayChange1)} className={`numeric`}>{item.dayChange1}%</td>
                                <td style={getReturnStyles(item.weekChange1)} className="numeric">{item.weekChange1}%</td>
                                <td style={getReturnStyles(item.weekChange2)} className="numeric">{item.weekChange2}%</td>
                                <td style={getReturnStyles(item.monthChange1)} className="numeric">{item.monthChange1}%</td>
                                <td style={getReturnStyles(item.monthChange3)} className="numeric">{item.monthChange3}%</td>
                                <td style={getReturnStyles(item.monthChange6)} className="numeric">{item.monthChange6}%</td>
                                <td style={getReturnStyles(item.yearChange1)} className="numeric">{item.yearChange1}%</td>

                            </tr>
                        )
                    })}
                </tbody>
                <tfoot style={{ fontWeight: 'bold' }}>
                    <tr>
                        <td>Average</td>
                        <td className="numeric"></td>
                        <td className="numeric">{averageReturns.dayChange1}%</td>
                        <td className="numeric">{averageReturns.weekChange1}%</td>
                        <td className="numeric">{averageReturns.weekChange2}%</td>
                        <td className="numeric">{averageReturns.monthChange1}%</td>
                        <td className="numeric">{averageReturns.monthChange3}%</td>
                        <td className="numeric">{averageReturns.monthChange6}%</td>
                        <td className="numeric">{averageReturns.yearChange1}%</td>
                    </tr>
                    {indexReturns.map((item, index) => {
                        return (
                            <tr key={index}>
                                <td>
                                    {item.name}
                                    {/* <button onClick={() => openChart(item.instrument)}>Chart</button> */}
                                    <Link className="pull-right" href={`/chart/${item.instrument}`}>
                                        <FaChartLine />
                                    </Link>
                                </td>
                                <td className="numeric">{item.price}</td>
                                <td className="numeric">{item.dayChange1}%</td>
                                <td className="numeric">{item.weekChange1}%</td>
                                <td className="numeric">{item.weekChange2}%</td>
                                <td className="numeric">{item.monthChange1}%</td>
                                <td className="numeric">{item.monthChange3}%</td>
                                <td className="numeric">{item.monthChange6}%</td>
                                <td className="numeric">{item.yearChange1}%</td>
                            </tr>
                        )
                    })}
                </tfoot>
            </table>
        </div>
    )
}

export default Portfolio;
