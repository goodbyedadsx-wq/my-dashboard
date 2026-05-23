'use client'

import { useState } from 'react'

const DEFAULT_ACCOUNTS = [
  {
    username: 'jalen',
    password: 'keven0820',
    role: 'owner',
    expiresAt: null,
  },
]

export default function CyberpunkDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [databaseText, setDatabaseText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('discord_database') || ''
    }

    return ''
  })
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState([])

  const [newUserUsername, setNewUserUsername] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState('user')
  const [newUserDays, setNewUserDays] = useState('30')

  const [selectedPage, setSelectedPage] = useState('search')

  const [accounts, setAccounts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard_accounts')

      if (saved) {
        return JSON.parse(saved)
      }
    }

    return DEFAULT_ACCOUNTS
  })

  const login = () => {
    setLoginError('')
    const found = accounts.find(
      (account: any) =>
        account.username === username &&
        account.password === password
    )

    if (!found) {
      setLoginError('ACCESS DENIED — INVALID LOGIN CREDENTIALS')
      return
    }

    if (found.expiresAt && Date.now() > found.expiresAt) {
      setLoginError('ACCESS DENIED — ACCOUNT EXPIRED')
      return
    }

    setLoginError('')
    setCurrentUser(found)
    setIsLoggedIn(true)
  }

  const createAccount = () => {
    if (currentUser?.role !== 'owner') {
      alert('Only owners can create accounts')
      return
    }

    if (!newUserUsername || !newUserPassword) {
      alert('Fill out all fields')
      return
    }

    const expiresAt =
      Number(newUserDays) > 0
        ? Date.now() + Number(newUserDays) * 24 * 60 * 60 * 1000
        : null

    const updatedAccounts = [
      ...accounts,
      {
        username: newUserUsername,
        password: newUserPassword,
        role: newUserRole,
        expiresAt,
      },
    ]

    setAccounts(updatedAccounts)

    localStorage.setItem(
      'dashboard_accounts',
      JSON.stringify(updatedAccounts)
    )

    setNewUserUsername('')
    setNewUserPassword('')
    setNewUserRole('user')
    setNewUserDays('30')

    alert('Account created successfully')
  }

  const logout = () => {
    setIsLoggedIn(false)
    setCurrentUser(null)
    setUsername('')
    setPassword('')
  }

  const saveDatabase = () => {
    if (currentUser?.role !== 'owner') {
      return
    }

    localStorage.setItem(
      'discord_database',
      databaseText
    )

    alert('Database Saved')
  }

  const searchDiscordId = async () => {
    setIsLoading(true)
    const savedDatabase =
      localStorage.getItem('discord_database') || ''

    const lines = savedDatabase
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const parsed = lines.map((line) => {
      const parts = line.split('|')

      return {
        discordId: parts[0]?.trim(),
        ip: parts[1]?.trim(),
      }
    })

    const filtered = parsed.filter((item) =>
      item.discordId?.includes(searchValue)
    )

    const resultsWithGeo = await Promise.all(
      filtered.map(async (item) => {
        try {
          const response = await fetch(
            `https://api.allorigins.win/raw?url=${encodeURIComponent(
              `http://ip-api.com/json/${item.ip}?fields=status,country,countryCode,regionName,city,zip,isp,as,mobile,proxy,hosting,lat,lon`
            )}`
          )

          const geo = await response.json()

          const data = geo

          console.log('IP API RESPONSE:', data)

          if (data.status !== 'success') {
            return {
              discordId: item.discordId,
              ip: item.ip,

              country: 'Unknown',
              region: 'Unknown',
              city: 'Unknown',
              postal: 'Unknown',
              coordinates: 'Unknown',

              isp: 'Unknown',
              asn: 'Unknown',
              vpn: 'Unknown',
              hosting: 'Unknown',
            }
          }

          return {
            discordId: item.discordId,
            ip: item.ip,

            country: data.country || 'Unknown',
            region: data.regionName || 'Unknown',
            city: data.city || 'Unknown',
            postal: data.zip || 'Unknown',
            coordinates: `${data.lat}, ${data.lon}`,

            isp: data.isp || 'Unknown',
            asn: data.as || 'Unknown',
            vpn: data.proxy ? '[DETECTED]' : '[NONE] ✅',
            hosting: data.hosting ? '[TRUE]' : '[FALSE]',
          }
        } catch {
          return {
            discordId: item.discordId,
            ip: item.ip,

            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            postal: 'Unknown',
            coordinates: 'Unknown',

            isp: 'Unknown',
            asn: 'Unknown',
            vpn: 'Unknown',
            hosting: 'Unknown',
          }
        }
      })
    )

    setResults(resultsWithGeo)
    setIsLoading(false)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden relative font-mono px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)] opacity-20" />

        <div className="relative z-10 w-full max-w-md border border-white/10 bg-black/70 backdrop-blur-2xl rounded-[32px] p-10 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.5em] text-white/40 mb-4">
            Authenticate
          </p>

          <h1 className="text-5xl font-black mb-10 leading-none">
            Welcome <span className="text-white/40">Back</span>
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-white/40 mb-3">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-transparent border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-white/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-white/40 mb-3">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-transparent border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-white/40 transition-all"
              />
            </div>

            {loginError && (
              <div className="border border-red-500/40 bg-red-500/10 text-red-400 rounded-2xl px-5 py-4 text-sm uppercase tracking-[0.2em]">
                {loginError}
              </div>
            )}

            <button
              onClick={login}
              className="w-full py-5 rounded-2xl bg-white text-black uppercase tracking-[0.3em] font-black hover:scale-[1.02] transition-all"
            >
              Access System
            </button>
          </div>

          
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="w-[260px] border-r border-white/10 bg-black/60 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white text-black rounded-xl flex items-center justify-center font-black">
                  ∆
                </div>

                <div>
                  <h1 className="font-black tracking-widest text-lg">
                    FDM
                  </h1>

                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                    discord lookup
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {[
                {
                  id: 'dashboard',
                  label: 'Dashboard',
                },
                {
                  id: 'search',
                  label: 'Search',
                },
                {
                  id: 'database',
                  label: 'Database',
                },
                {
                  id: 'owner',
                  label:
                    currentUser?.role === 'owner'
                      ? 'Owner Panel'
                      : 'Admin Panel',
                },
                {
                  id: 'settings',
                  label: 'Settings',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedPage(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border uppercase tracking-[0.2em] text-sm transition-all ${
                    selectedPage === item.id
                      ? 'bg-white text-black border-white'
                      : 'border-white/10 hover:bg-white/5 hover:border-white/30'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="border border-white/10 rounded-2xl bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
                Active Session
              </p>

              <div className="mb-4">
                <h2 className="font-bold text-lg">
                  {currentUser?.username}
                </h2>

                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  {currentUser?.role}
                </p>
              </div>

              <button
                onClick={logout}
                className="w-full border border-white/20 rounded-xl py-3 uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-black transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-10 overflow-auto relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/40 mb-3">
                Query Console
              </p>

              <h1 className="text-6xl font-black leading-none">
                USER <span className="text-white/40">SCANNER</span>
              </h1>
            </div>

            <div className="px-6 py-4 bg-white text-black rounded-2xl uppercase tracking-[0.3em] text-sm font-black">
              {currentUser?.role}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              ['10M+', 'Profiles'],
              ['99.8%', 'Uptime'],
              ['<80ms', 'Latency'],
            ].map(([value, label]) => (
              <div
                key={label}
                className="border border-white/10 rounded-3xl bg-white/[0.03] p-8"
              >
                <h2 className="text-4xl font-black mb-2">{value}</h2>

                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {currentUser?.role === 'owner' && selectedPage === 'owner' && (
            <div className="border border-white/10 rounded-[32px] bg-black/50 backdrop-blur-2xl p-8 shadow-2xl mb-10">
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-3">
                  Owner Panel
                </p>

                <h2 className="text-4xl font-black mb-3">
                  Account Management
                </h2>

                <p className="text-white/40">
                  Create admin or user accounts with expiration dates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="Username"
                  className="border border-white/10 bg-transparent rounded-2xl px-5 py-4 outline-none focus:border-white/40"
                />

                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Password"
                  className="border border-white/10 bg-transparent rounded-2xl px-5 py-4 outline-none focus:border-white/40"
                />

                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="border border-white/10 bg-black rounded-2xl px-5 py-4 outline-none focus:border-white/40"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>

                <input
                  type="number"
                  value={newUserDays}
                  onChange={(e) => setNewUserDays(e.target.value)}
                  placeholder="Days Until Expiration"
                  className="border border-white/10 bg-transparent rounded-2xl px-5 py-4 outline-none focus:border-white/40"
                />
              </div>

              <button
                onClick={createAccount}
                className="mt-6 px-8 py-4 rounded-2xl bg-white text-black uppercase tracking-[0.3em] text-sm font-black hover:scale-105 transition-all"
              >
                Create Account
              </button>

              <div className="mt-8 space-y-3">
                {accounts.map((account, index) => (
                  <div
                    key={index}
                    className="border border-white/10 rounded-2xl p-4 bg-white/[0.03]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="font-black text-lg">
                          {account.username}
                        </h3>

                        <p className="text-white/40 uppercase text-xs tracking-[0.3em]">
                          {account.role}
                        </p>
                      </div>

                      <div className="text-sm text-white/60">
                        {account.expiresAt
                          ? `Expires ${new Date(account.expiresAt).toLocaleDateString()}`
                          : 'No Expiration'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                      </div>
          )}

          {selectedPage === 'database' && currentUser?.role === 'owner' && (
          <div className="border border-white/10 rounded-[32px] bg-black/50 backdrop-blur-2xl p-8 shadow-2xl mb-10">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-3">
                DATABASE
              </p>

              <h2 className="text-4xl font-black mb-3">
                Manage Database
              </h2>

              <p className="text-white/40">
                Add entries using this format:
              </p>

              <div className="mt-3 border border-white/10 rounded-2xl p-4 bg-white/[0.03] text-white/80">
                Discord Id | IP
              </div>
            </div>

            <textarea
              value={databaseText}
              onChange={(e) => {
                const value = e.target.value
                setDatabaseText(value)

                localStorage.setItem(
                  'discord_database',
                  value
                )
              }}
              placeholder={`1196177759639191674 | 172.58.22.10`}
              className="w-full h-72 border border-white/10 bg-transparent rounded-2xl p-5 outline-none focus:border-white/40 mb-6"
            />

            <button
              onClick={saveDatabase}
              className="px-8 py-4 rounded-2xl bg-white text-black uppercase tracking-[0.3em] text-sm font-black hover:scale-105 transition-all"
            >
              Save Database
            </button>
          </div>
          )}

          {selectedPage === 'search' && (
          <div className="border border-white/10 rounded-[32px] bg-black/50 backdrop-blur-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-3">
                Search Discord ID
              </p>

              <h2 className="text-4xl font-black mb-3">Lookup Search</h2>

              <p className="text-white/40">
                Lookup Discord IDs
                <span className="text-white"> </span>
              </p>
            </div>

            

            

            <div className="flex gap-4 mb-8">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search Discord ID"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchDiscordId()
                  }
                }}
                className="flex-1 bg-transparent border border-white/10 rounded-2xl px-5 py-5 outline-none focus:border-white/40 transition-all"
              />

              <button
                onClick={searchDiscordId}
                className="px-10 py-5 rounded-2xl bg-white text-black uppercase tracking-[0.3em] text-sm font-black hover:scale-105 transition-all"
              >
                {isLoading ? 'Loading...' : 'Lookup'}
              </button>
            </div>

            <div className="mt-10 space-y-4">
              {results.length === 0 ? (
                <div className="border border-white/10 rounded-2xl p-6 text-white/30">
                  No results found.
                </div>
              ) : (
                results.map((result, index) => (
                  <div
                    key={index}
                    className="border border-white/10 rounded-2xl bg-white/[0.03] p-6"
                  >
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">
                        Discord ID
                      </p>

                      <h2 className="text-2xl font-black">
                        {result.discordId}
                      </h2>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
                        IP ADDRESS
                      </p>

                      <div className="text-white/90 mb-6 font-bold text-lg break-all">
                        {result.ip}
                      </div>

                      <div className="border border-white/10 rounded-2xl bg-black/40 p-5 space-y-3 text-sm">
                        <h3 className="text-white font-black uppercase tracking-[0.3em] mb-4">
                          GEOLOCATION DATA
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-white/40">COUNTRY:</span>{' '}
                            {result.country}
                          </div>

                          <div>
                            <span className="text-white/40">REGION:</span>{' '}
                            {result.region}
                          </div>

                          <div>
                            <span className="text-white/40">CITY:</span>{' '}
                            {result.city}
                          </div>

                          <div>
                            <span className="text-white/40">POSTAL CODE:</span>{' '}
                            {result.postal}
                          </div>

                          <div className="md:col-span-2">
                            <span className="text-white/40">COORDINATES:</span>{' '}
                            {result.coordinates}
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-4 mt-4">
                          <h3 className="text-white font-black uppercase tracking-[0.3em] mb-4">
                            ANALYSIS
                          </h3>

                          <div className="space-y-3">
                            <div>
                              <span className="text-white/40">ISP:</span>{' '}
                              {result.isp}
                            </div>

                            <div>
                              <span className="text-white/40">ASN:</span>{' '}
                              {result.asn}
                            </div>

                            <div>
                              <span className="text-white/40">VPN/PROXY:</span>{' '}
                              {result.vpn}
                            </div>

                            <div>
                              <span className="text-white/40">HOSTING:</span>{' '}
                              {result.hosting}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  )
}
