import React from 'react';
import PropTypes from 'prop-types';

// https://reactjs.org/docs/error-boundaries.html

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch() {
    // You can also log the error to an error reporting service
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    const { children } = this.props;

    return children;
  }
}

ErrorBoundary.defaultProps = {
  children: ''
};

ErrorBoundary.propTypes = {
  children: PropTypes.element
};

export default ErrorBoundary;
