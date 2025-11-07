"use client";
import { useParams } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, ISeriesApi, Time, WhitespaceData } from 'lightweight-charts';
import { GLOBAL_LIST, intervalOptions, smaOptions } from "@/app/utils/constants";
import { sma } from 'indicatorts';
import moment from "moment";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
console.log(API_URL);

const chartProperties = {
    width: 1200,
    height: 500,
    timeScale: {
        timeVisible: true,
        secondsVisible: true,
    },
    pane: 0,
};

interface priceSeries {
    open: number,
    high: number,
    low: number,
    close: number,
    time: Time
};

interface volumeSeries {
    value: number,
    time: Time
};

interface smaSeries {
    value: number,
    time: Time
}

type CandleData = [string, number, number, number, number, number];

// type ChartSeries<T> = T extends keyof SeriesOptionsMap => ISeriesApi<T, Time, WhitespaceData<Time>>
type ChartPriceSeries = ISeriesApi<"Candlestick", Time, WhitespaceData<Time>>;
type ChartVolumeSeries = ISeriesApi<"Histogram", Time, WhitespaceData<Time>>;
type ChartSmaSeries = ISeriesApi<"Line", Time, WhitespaceData<Time>>

type ChartDataRefType = {
    priceSeries: ChartPriceSeries,
    volumeSeries: ChartVolumeSeries,
    smaSeries: ChartSmaSeries
}

const Chart = () => {
    const { key } = useParams();
    const [name, setName] = useState<string>('');
    const [interval, setInterval] = useState<string>('day');
    const [selectedSma, selectSma] = useState<number>(10);
    const chartRef = useRef<HTMLDivElement>(null);
    const dataRef = useRef<ChartDataRefType>(null);

    const fetchData = (series: ChartPriceSeries, vSeries: ChartVolumeSeries, smaSeries: ChartSmaSeries) => {
        // make an api call to fetch data
        const deliveryPayload = {
            filter: {
                instruments: [key],
                interval,
                from_date: '2024-11-12',
                // "to_date": "2025-03-03"
                to_date: new Date().toISOString().split('T')[0]
            }
        }
        const intradayPayload = {
            filter: {
                instruments: [key],
                interval,
            }
        }
        if (interval === 'day' || interval === 'week') {
            // no intraday data exist for day or week intervals?
            intradayPayload.filter.interval = '30minute';
        }
        const promiseArray = [];

        const intradayReq = fetch(`${API_URL}/intradayData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(intradayPayload)
        });

        promiseArray.push(intradayReq);

        if (interval !== '1minute' && interval !== '30minute') {
            const deliveryReq = fetch(`${API_URL}/historicalDataUpstox`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deliveryPayload)
            });
            promiseArray.push(deliveryReq);
        }

        Promise.all(promiseArray)
            // .then(response => response.json())
            .then((response) => {
                return Promise.all(response.map((res) => res.json()));
            })
            .then(([iData, dData]) => {
                const ohlcData: priceSeries[] = [];
                const volumeData: volumeSeries[] = [];
                const smaData: smaSeries[] = [];
                let name = '';
                let combinedData = [];
                // consider intraday data only daily chart is requested
                // TBD - handle weekly data
                if (dData && dData[0].candles.length && iData[0].candles.length && dData[0].candles[0][0].split('T')[0] !== iData[0].candles[0][0].split('T')[0]) {
                    combinedData = [...dData];
                    //   find total volume
                    const intradayVolume = iData[0].candles.reduce((acc: number, item: CandleData) => {
                        return acc + item[5];
                    }, 0)
                    combinedData[0].candles.unshift(iData[0].candles[0]);
                    combinedData[0].candles[0][5] = intradayVolume;
                } else {
                    combinedData = [...iData];
                }
                console.log(combinedData);
                // sma
                const closeArr = combinedData[0].candles.map((item: CandleData) => item[4]).reverse();
                const smaValue = new Array(selectedSma - 1).concat(sma(closeArr, { period: selectedSma }));
                console.log('..............', sma, smaValue);

                combinedData.forEach((item) => {
                    const instrumentDetails = GLOBAL_LIST[item.instrument] || {};
                    name = instrumentDetails.name || item.instrument;
                    item.candles.reverse().forEach((candle: CandleData, index: number) => {
                        ohlcData.push({
                            open: candle[1],
                            high: candle[2],
                            low: candle[3],
                            close: candle[4],
                            time: +(new Date(candle[0])) / 1000 as Time
                        });

                        volumeData.push({
                            value: candle[5],
                            time: +moment(candle[0])/1000 as Time
                        });

                        smaData.push({
                            value: smaValue[index],
                            time: +(new Date(candle[0])) / 1000 as Time
                        });
                    });
                })
                series.setData(ohlcData);
                vSeries.setData(volumeData)
                smaSeries.setData(smaData);
                setName(name);
            })
            .catch(error => console.error(error));
    }

    useEffect(() => {
        const container = chartRef.current as HTMLElement;
        const chart = createChart(container, chartProperties);
        // const priceSeries = chart.addCandlestickSeries({});
        const priceSeries: ChartPriceSeries = chart.addSeries(CandlestickSeries);
        // const priceSeries: ChartSeries<"Candlestick"> = chart.addSeries(CandlestickSeries);
        const volumeSeries: ChartVolumeSeries = chart.addSeries(HistogramSeries, {
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '', // set as an overlay by setting a blank priceScaleId
            // color: 'blue',
            // lineWidth: 1,
            // pane: 2,
            // height: 50
        });

        const smaSeries: ChartSmaSeries = chart.addSeries(LineSeries, {
            // priceFormat: {
            //     type: 'volume',
            // },
            // priceScaleId: '', // set as an overlay by setting a blank priceScaleId
            color: 'green',
            lineWidth: 1,
            // pane: 2,
            // height: 50
        });

        volumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.8, // highest point of the series will be 70% away from the top
                bottom: 0, // lowest point will be at the very bottom.
            },
        });

        dataRef.current = {
            priceSeries, volumeSeries, smaSeries
        }
        // fetchData(priceSeries, volumeSeries);
    }, [chartRef]);

    useEffect(() => {
        if (dataRef.current) {
            const { priceSeries, volumeSeries, smaSeries } = dataRef.current;
            fetchData(priceSeries, volumeSeries, smaSeries);    
        }
    }, [interval])

    const renderIntervals = () => {
        return (
            <div className="chart-intervals">
                {intervalOptions.map((item, index) => (
                    <button key={item.value} className={item.value === interval ? 'active' : ''} onClick={() => changeInterval(index)}>{item.label}</button>
                ))}
            </div>
        );
    }

    const renderSmaOptions = () => {
        return (
            <div className="chart-sma-options">
                {smaOptions.map((item, index) => (
                    <button key={item.value} className={item.value === selectedSma ? 'active' : ''} onClick={() => changeSma(index)}>{item.label}</button>
                ))}
            </div>
        );
    }

    const renderHeader = () => {
        return (
            <div style={{padding: '14px 0'}}>
                {renderIntervals()}
                <br />
                {renderSmaOptions()}
            </div>
        )
    }

    const changeInterval = (index: number) => {
        setInterval(intervalOptions[index].value);
    }

    const changeSma = (index: number) => {
        selectSma(smaOptions[index].value);
    }

    return (
        <div>
            {/* <Link className="pull-right" href="/">Home</Link> */}
            <h1>{name}</h1>
            {renderHeader()}
            {/* {renderIntervals()} */}
            <div ref={chartRef}></div>
        </div>
    );
}

export default Chart;