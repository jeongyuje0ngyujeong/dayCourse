import React from "react";
 
const TabButton = ({ active, children, onClick }) => {
    return (
        <button
            onClick={onClick} // 클릭 핸들러
            style={{
                padding: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: active ? 'bold' : 'normal', // active에 따라 스타일 조정
                color:' #36451c',
                margin:'5px'
            }}
        >
            {children}
        </button>
    );
};

export default TabButton;