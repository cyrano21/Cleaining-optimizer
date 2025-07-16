import "../styles/globals.css";
import PropTypes from 'prop-types';

export const metadata = {
  title: "Hotel Cleaning Management",
  description: "Manage hotel room cleaning efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
