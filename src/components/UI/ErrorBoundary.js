import React, {Component} from "react";

export default class ErrorBoundary extends Component {
  constructor (props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError () {
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {  
    console.error(error);
    console.error(errorInfo);  
  }
 
  render () {
    const {
      children,
      fallback = <h1>Something went wrong.</h1>
    } = this.props;

    return this.state.hasError ? fallback : children;
  }
}