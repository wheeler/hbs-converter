import React from 'react';
import PropTypes from 'prop-types';

const Component = props => (
  <div>
    Hello, {props.firstName} {props.lastName}. Welcome to {props.product}
  </div>
);

Component.propTypes = {
  firstName: PropTypes.any.isRequired,
  lastName: PropTypes.any.isRequired,
  product: PropTypes.any.isRequired,
};

export default Component;
