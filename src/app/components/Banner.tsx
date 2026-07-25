'use client';

import Link from "next/link";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import MarketStatus from "./MarketStatus";
import { RestrictedNav } from "./RestrictedNav";
import { useAuth } from "./AuthProvider";

export default function Banner() {
    const { user } = useAuth();
    return (
        <div className="header" style={{ background: '#52b2ffa1' }}>
            <div className="logo text-center" style={{ backgroundColor: '#52a9ff' }}>
                <div className="text-3xl inline-block">InvestEasy</div>
                <br />
                <div className="inline-block"><RiMoneyRupeeCircleFill style={{ fontSize: '40px' }} /></div>
            </div>
            <div className="nav">
                <div>
                    {/* <Link className="nav-item" href='/dashboard/chart/NSE_INDEX%7CNifty%2050'>Home</Link>                 */}
                    <Link className="nav-item" href='/dashboard'>Home</Link>
                    {/* <Link className="nav-item" href='/dashboard/old-portfolio'>Old Portfolios</Link> */}
                    <Link className="nav-item" href='/dashboard/model-portfolio'>Model Portfolios</Link>
                    <Link className="nav-item" href='/dashboard/portfolio-commentary'>Portfolio Commentary</Link>
                    <Link className="nav-item" href='/dashboard/watchlist'>Watchlist</Link>
                    <Link className="nav-item" href='/dashboard/youtube-video'>YouTube Videos</Link>
                    {/* <Link className="nav-item" href='/dashboard/holidays'>Market Holidays</Link>                 */}
                </div>
                <div>
                    {/* {user && <RestrictedNav />} */}
                    <RestrictedNav />
                </div>
            </div>

            <MarketStatus />

        </div>
    );
}