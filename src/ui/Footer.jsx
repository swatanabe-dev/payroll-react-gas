import "./Footer.css";
function Footer() {
  const date = new Date();
  const currYear = date.getFullYear();

  return (
    <footer className="footer">
      <p>
        © {currYear === 2025 ? currYear : `2025 - ${currYear}`} Shotaro
        Watanabe. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
