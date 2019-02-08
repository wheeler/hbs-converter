import React from 'react';
import PropTypes from 'prop-types';

const Component = props => (
  <div>
    {props.hasUpcomingDonations ? (
      <div>the if case</div>
    ) : (
      <p>the else case</p>
    )}
  </div>
);

Component.propTypes = {
  hasUpcomingDonations: PropTypes.any.isRequired,
};

export default Component;
