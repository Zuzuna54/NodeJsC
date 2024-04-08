import React from 'react';
import PropTypes from 'prop-types';

function RouteWithLayout({ component }) {
  return <div>{component}</div>;
}

RouteWithLayout.defaultProps = {
  component: null
};

RouteWithLayout.propTypes = {
  component: PropTypes.element
};

export default RouteWithLayout;
