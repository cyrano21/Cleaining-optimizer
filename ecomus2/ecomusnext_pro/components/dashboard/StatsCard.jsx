'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon,
  prefix = '',
  suffix = ''
}) {
  const isPositive = changeType === 'positive'
  
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {Icon && (
              <Icon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
                </div>
                {change !== undefined && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                    )}
                    <span className="sr-only">
                      {isPositive ? 'Augmentation' : 'Diminution'} de
                    </span>
                    {Math.abs(change)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
