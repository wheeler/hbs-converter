import React from 'react';
import PropTypes from 'prop-types';

const Component = props => <div>Hello, {props.firstName}</div>;

Component.propTypes = {
  firstName: PropTypes.any.isRequired,
};

export default Component;
