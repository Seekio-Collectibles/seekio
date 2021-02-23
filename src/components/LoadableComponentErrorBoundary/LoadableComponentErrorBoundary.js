import React, { Component } from 'react';
import { bool, object } from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import * as log from '../../util/log';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  Page,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '../../components';
import { TopbarContainer } from '../../containers';

import css from './LoadableComponentErrorBoundary.module.css';

export class LoadableComponentErrorBoundaryPageComponent extends Component {
  constructor(props) {
    super(props);
    // The StaticRouter component used in server side rendering
    // provides the context object. We attach a `notfound` flag to
    // the context to tell the server to change the response status
    // code into a 404.
    this.props.staticContext.notfound = true;
  }

  render() {
    const { intl, scrollingDisabled } = this.props;

    const title = intl.formatMessage({
      id: 'LoadableComponentErrorBoundaryPage.title',
    });

    return (
      <Page title={title} scrollingDisabled={scrollingDisabled}>
        <LayoutSingleColumn>
          <LayoutWrapperTopbar>
            <TopbarContainer />
          </LayoutWrapperTopbar>
          <LayoutWrapperMain>
            <div className={css.root}>
              <div className={css.content}>
                <div className={css.number}>404</div>
                <h1 className={css.heading}>
                  <FormattedMessage id="LoadableComponentErrorBoundaryPage.heading" />
                </h1>
                <p className={css.description}>
                  <FormattedMessage id="LoadableComponentErrorBoundaryPage.description" />
                </p>
              </div>
            </div>
          </LayoutWrapperMain>
          <LayoutWrapperFooter>
            <Footer />
          </LayoutWrapperFooter>
        </LayoutSingleColumn>
      </Page>
    );
  }
}

LoadableComponentErrorBoundaryPageComponent.defaultProps = {
  staticContext: {},
};

LoadableComponentErrorBoundaryPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,

  // context object from StaticRouter, injected by the withRouter wrapper
  staticContext: object,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  return {
    scrollingDisabled: isScrollingDisabled(state),
  };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LoadableComponentErrorBoundaryPage = compose(
  connect(mapStateToProps),
  injectIntl
)(LoadableComponentErrorBoundaryPageComponent);

// Use ErrorBoyndary to catch ChunkLoadError
// https://reactjs.org/docs/error-boundaries.html
class LoadableComponentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    log.error(error, 'error-catched-in-loadable-component-error-boundary', errorInfo);
  }

  render() {
    if (this.state.error && this.state.error.name === 'ChunkLoadError') {
      return <LoadableComponentErrorBoundaryPage />;
    }

    return this.props.children;
  }
}

export default LoadableComponentErrorBoundary;
