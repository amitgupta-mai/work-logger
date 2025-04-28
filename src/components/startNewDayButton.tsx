export const StartNewDayButton = ({
  startNewDay,
}: {
  startNewDay: () => void;
}) => {
  return (
    <button onClick={startNewDay} className='start-new-day'>
      🌅 Start New Day
    </button>
  );
};
