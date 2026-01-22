'use client';

import React, { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  organizationId: string;
  status: string;
  organizationName?: string;
}

interface Member {
  organizationId: string;
  organizationName: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const [orgsRes, invitesRes, membersRes] = await Promise.all([
          fetch('/api/profile/organizations'),
          fetch('/api/profile/invitations'),
          fetch('/api/profile/members'),
        ]);

        if (orgsRes.ok) {
          const orgsData = await orgsRes.json();
          setOrganizations(orgsData || []);
        }

        if (invitesRes.ok) {
          const invitesData = await invitesRes.json();
          setInvitations(invitesData || []);
        }

        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData || []);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingEmail(true);
      const response = await fetch('/api/profile/email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        // Show success toast
      }
    } catch (error) {
      console.error('Failed to update email:', error);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
          <p className="text-slate-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Your Email Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your email</h2>
          <form onSubmit={handleUpdateEmail}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2"
              />
            </div>
            <Button
              type="submit"
              disabled={isUpdatingEmail}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isUpdatingEmail ? 'Updating...' : 'Update email'}
            </Button>
          </form>
        </div>

        {/* Invites Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Invites</h2>
          {invitations.length === 0 ? (
            <p className="text-slate-600">There are no pending invites.</p>
          ) : (
            <div className="space-y-3">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div>
                    <p className="font-medium text-slate-900">{invite.email}</p>
                    <p className="text-sm text-slate-600">{invite.organizationName}</p>
                  </div>
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Teams/Organizations Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Teams</h2>
          <p className="text-slate-600 text-sm mb-4">
            The teams that are associated with your account.
          </p>
          
          {isLoading ? (
            <p className="text-slate-600">Loading teams...</p>
          ) : members.length === 0 ? (
            <p className="text-slate-600">You are not a member of any teams yet.</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={`${member.organizationId}-${member.organizationName}`}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                      {member.organizationName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{member.organizationName}</p>
                      <p className="text-xs text-slate-600">
                        Joined on {new Date(member.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                      {member.role}
                    </span>
                    <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Authentication Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Authentication</h2>
          <p className="text-slate-600 text-sm mb-6">
            Link your account to third-party authentication providers.
          </p>

          <div className="space-y-4">
            {/* Google */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900">Google</p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-600 mb-2">
                  Connected on Jan 22, 2026
                </p>
                <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* GitHub */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900">GitHub</p>
                  <p className="text-xs text-slate-600">Not connected</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Link GitHub
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Link Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
