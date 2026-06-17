export default function DifficultyPill({ difficulty }) {
  return (
    <span className={`pill pill-${difficulty}`}>{difficulty}</span>
  );
}
