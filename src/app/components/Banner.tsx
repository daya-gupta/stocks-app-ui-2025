import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
// import { FaCodepen } from "react-icons/fa";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";

export default function Banner() {
    return (
        <div className="header" style={{ background: '#52b2ffa1'}}>
            <div className="logo" style={{ backgroundColor: '#52a9ff', borderRadius: '50%' }}>
                {/* <FaCodepen className="icon-large" /> */}
                Generate
                <br />
                {/* <RiMoneyRupeeCircleFill style={{fontSize: '50px'}} /> */}
                <span className="text-3xl">Alpha</span>
            </div>
            <div className="nav">
                <Link className="nav-item" href='/chart/NSE_INDEX%7CNifty%2050'>Home</Link>                
                <Link className="nav-item" href='/dashboard/model-portfolio'>Model Portfolios</Link>                
                <Link className="nav-item" href='/dashboard/youtube-video'>YouTube Videos</Link>                
                <Link className="nav-item" href='/dashboard/holidays'>Market Holidays</Link>                
            </div>
            <div className="profile">
                <FaUserCircle className="icon-medium" style={{fontSize: '50px'}}  />
                {/* Profile */}
            </div>
            {/* <h1>Navigation</h1> */}
        </div>
    );
}