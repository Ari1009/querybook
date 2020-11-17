import { Button, IButtonProps } from '../Button/Button';
import React from 'react';
import classNames from 'classnames';

export interface IAsyncButtonProps extends IButtonProps {
    onClick: (...args: any[]) => Promise<any>;
    disableWhileAsync?: boolean;
}

export interface IAsyncButtonState {
    loading?: boolean;
}

export class AsyncButton extends React.PureComponent<
    IAsyncButtonProps,
    IAsyncButtonState
> {
    public static defaultProps: Partial<IAsyncButtonProps> = {
        disableWhileAsync: true,
    };
    private canSetState: boolean = true;

    public constructor(props: IAsyncButtonProps) {
        super(props);

        this.state = {
            loading: false,
        };
    }

    public componentWillUnmount() {
        this.canSetState = false;
    }

    public asyncSetState(newState: Partial<IAsyncButtonState>) {
        return new Promise((resolve) => {
            if (this.canSetState) {
                this.setState(newState, resolve);
            }
        });
    }

    public onClick = async (...args: any[]) => {
        const { disableWhileAsync } = this.props;
        const { loading } = this.state;
        if (!(loading && disableWhileAsync)) {
            await this.asyncSetState({ loading: true });
            try {
                await this.props.onClick(...args);
            } finally {
                await this.asyncSetState({ loading: false });
            }
        }
    };

    public render() {
        const { disableWhileAsync, ...propsForButton } = this.props;
        const { loading } = this.state;

        const buttonProps: IButtonProps = {
            ...propsForButton,

            onClick: this.onClick,
            isLoading: loading,
            className: classNames({
                [propsForButton.className || '']: true,
            }),
        };
        return <Button {...buttonProps}>{this.props.children}</Button>;
    }
}
