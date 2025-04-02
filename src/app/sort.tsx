'use client';
import { FaSortDown, FaSortUp } from "react-icons/fa6";

type PropType = {
    sortOrder: number,
    handleSortChange: (newOrder: number) => void
}
const Sort = ({ sortOrder, handleSortChange }: PropType) => {
    function onChange() {
        const newOrder = sortOrder === 1 ? -1 : 1;
        handleSortChange(newOrder);
    }
    return (
        <span style={{ position: 'relative', top: '4px', left: '4px' }} onClick={onChange}>
            <FaSortUp />
            <FaSortDown style={{ position: 'relative', left: '-16px' }} />
        </span>
    )
}

export default Sort;