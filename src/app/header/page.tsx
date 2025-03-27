import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
// import { FaCodepen } from "react-icons/fa";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";

export default function Header() {
    return (
        <div className="header">
            <div className="logo" style={{ backgroundColor: '#52a9ff' }}>
                {/* <FaCodepen className="icon-large" /> */}
                Grow
                <RiMoneyRupeeCircleFill style={{fontSize: '50px'}} />
                More
            </div>
            <div className="nav">
                <Link className="nav-item" href='/chart/NSE_INDEX%7CNifty%2050'>Home</Link>                
                <Link className="nav-item" href='/model-portfolio'>Model Portfolios</Link>                
                <Link className="nav-item" href='/youtube-video'>YouTube Videos</Link>                
            </div>
            <div className="profile">
                <FaUserCircle className="icon-medium" style={{fontSize: '50px'}}  />
                {/* Profile */}
            </div>
            {/* <h1>Navigation</h1> */}
        </div>
    );
}