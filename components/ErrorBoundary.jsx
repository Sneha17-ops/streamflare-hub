"use client";

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Optionally log to server here
    // console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[18rem] p-6">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-300">Visualizer temporarily unavailable</p>
            <p className="text-xs text-slate-500 mt-2">This feature had an error — try reloading the page.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
