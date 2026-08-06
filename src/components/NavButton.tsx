import React from 'react';

export const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => {
  const handleClick = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(5);
    onClick();
  };

  return (
    <button onClick={handleClick} className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-shirqat-primary' : 'text-slate-400'}`}>
      {icon}
      <span className={`text-[10px] font-black ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </button>
  );
};
