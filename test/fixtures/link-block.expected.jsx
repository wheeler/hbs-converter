import React from 'react';
import { Link } from 'components/elements';

export default () => (
  <div>
    <div>
      1 -{' '}
      <Link href='/nonblock' className='nb-class'>
        Non-Block
      </Link>
    </div>
    <div>
      2 -{' '}
      <Link href='/textchild' className='tc-class'>
        link
      </Link>
    </div>
    <div>
      3 -{' '}
      <Link href='/htmlchild' className='tc-class'>
        <div>link</div>
      </Link>
    </div>
  </div>
);
