import React from "react";
 
const TabButton = ({ active, children, onClick }) => {
    return (
        <button
            onClick={onClick} // 클릭 핸들러
            style={{
             
                alignItems: 'center', // 수직 중앙 정렬
                padding: '10px',
                background: active ? '#90B54C':'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius:'30px',
                boxShadow:  active ? 'inset 0 2px 5px rgba(0, 0, 0, 0.1)':'none',
                fontWeight: 'bold', 
                fontSize:'2vh',
                color: active ? ' white ':'#36451c',
                margin:'5px',
                flex: 1,
                position: 'relative', // 배지 위치 조정을 위해 relative 설정
              
            }}
        >
            {children}
        </button>
    );
};

export default TabButton;