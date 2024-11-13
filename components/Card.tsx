const Card = ({ title, description, imgSrc, href }) => (
  <div className="md max-w-[544px] p-4 md:w-1/2 text-primary font-display">
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {/* ...existing code... */}
    </div>
  </div>
);
