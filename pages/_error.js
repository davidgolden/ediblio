import React from 'react';
import styles from './styles/_error.module.scss';
import classNames from 'classnames';

export default function ErrorPage(props) {
    const errorMessageClassName = classNames({
        [styles.errorMessage]: true,
        [styles.errorMessageStatusCode]: props.statusCode,
    });

    return <div className={styles.container}>
        {props.statusCode && <div className={styles.statusCode}>
            <span>{props.statusCode}</span>
        </div>}
        <div className={errorMessageClassName}>
            <h1>Whoops.. looks like we made a mistake!</h1>
        </div>
        <h2>{props.errorMessage}</h2>
    </div>
}

export async function getServerSideProps(ctx) {
    let errorMessage = '';
    if (ctx.req.query?.err) {
        errorMessage = ctx.req.query.err;
    }
    return {props: {errorMessage, statusCode: ctx.req.statusCode}}
}
