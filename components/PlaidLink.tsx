'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { plaidClient } from "@/lib/plaid";
import { Button } from "./ui/button";
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from "react-plaid-link";
import { StyledString } from "next/dist/build/swc/types";
import { createLinkToken } from "@/lib/actions/user.actions";

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
    const router = useRouter();

    const [token, setToken] = useState('');
    
    useEffect(() => {
        const getLinkToken = async () => {
            const data = await createLinkToken(user);

            setToken(data?.linkToken);
        }

        getLinkToken();
    }, []);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) => {
        // await exchangePublicToken({
        //     publicToken: public_token,
        //     user,
        // });

        router.push('/');
    }, [user])

    const config: PlaidLinkOptions = {
        token,
        onSuccess
    }

    const { open, ready } = usePlaidLink(config);

    return(
        <>
            {variant === 'primary' ? (
                <Button
                    onClick={() => open()}
                    disabled={!ready}
                    className="plaidlink-primary">
                    Connect Bank
                </Button>
            ) : variant === 'ghost' ? (
                <Button className="w-full">
                    Connect Bank
                </Button>
            ) : (
                <Button className="w-full">
                    Connect Bank
                </Button>
            )}
        </>
    )
}

export default PlaidLink;
