import React, { Fragment } from 'react';

const Spinner = () => (
  <Fragment>
    <img
      src='/assets/spinner3.gif'
      style={{ width: '220px', margin: 'auto', display: 'block', borderRadius: '50%' }}
      alt="Loading..."
    />
  </Fragment>
);

export default Spinner;
