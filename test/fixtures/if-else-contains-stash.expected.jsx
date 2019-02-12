import React from 'react';
import PropTypes from 'prop-types';

const Component = props => (
  <td>
    {props.someBool
      ? props.formatDate(props.trueDate)
      : props.formatDate(props.falseDate)}
  </td>
);

Component.propTypes = {
  someBool: PropTypes.any.isRequired,
  formatDate: PropTypes.any.isRequired,
  trueDate: PropTypes.any.isRequired,
  falseDate: PropTypes.any.isRequired,
};

export default Component;
