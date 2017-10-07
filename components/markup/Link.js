// @flow

import Link from 'next/link';

import Colors from '../../services/Colors';

export default (props: Object) => {
  return (
    <span>
      <style jsx>{`
        a,
        a:hover,
        a:focus {
          color: ${Colors.red};
          text-decoration: none;
        }

        a:hover,
        a:focus {
          text-decoration: underline;
        }

        a[href^='#error:'] {
          background: red;
          color: white;
        }
      `}</style>
      <Link {...props}>
        <a>{props.children}</a>
      </Link>
    </span>
  );
};