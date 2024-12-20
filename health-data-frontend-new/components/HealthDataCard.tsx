'use client';

import { formatEther } from 'viem';

interface HealthDataCardProps {
    id: number;
    dataHash: string;
    owner: string;
    price: string;
    isOwner: boolean;
    onUpdatePrice: (id: number, currentPrice: string) => void;
}

export function HealthDataCard({
    id,
    dataHash,
    owner,
    price,
    isOwner,
    onUpdatePrice
}: HealthDataCardProps) {
    const shortenHash = (hash: string) => `${hash.slice(0, 6)}...${hash.slice(-4)}`;

    return (
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all duration-200">
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">ID: {id}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {formatEther(BigInt(price))} ETH
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="text-xs">
                        <span className="text-gray-500">Hash: </span>
                        <span className="font-mono" title={dataHash}>
                            {shortenHash(dataHash)}
                        </span>
                    </div>
                    <div className="text-xs">
                        <span className="text-gray-500">Owner: </span>
                        <span className="font-mono" title={owner}>
                            {isOwner ? 'You' : shortenHash(owner)}
                        </span>
                    </div>
                </div>

                {isOwner && (
                    <div className="pt-3 flex justify-end">
                        <button
                            onClick={() => onUpdatePrice(id, price)}
                            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Update Price
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}