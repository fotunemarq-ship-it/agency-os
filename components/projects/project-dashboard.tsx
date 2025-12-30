"use client";

import { useState } from "react";
import clsx from "clsx";
import { LayoutDashboard, ListTodo, Flag, FolderOpen, GitPullRequest, Settings, ArrowLeft, Calendar, Clock, Briefcase, Users } from "lucide-react";
import Link from "next/link";
import TaskManager from "./task-manager";
import MilestoneManager from "./milestone-manager";
import DeliverableManager from "./deliverable-manager";
import ChangeRequestBoard from "./change-request-board";
import ActivityTimeline from "@/components/ActivityTimeline";

interface ProjectDashboardProps {
    project: any;
    tasks: any[];
    milestones: any[];
    deliverables: any[];
    changeRequests: any[];
    tasksError?: any;
    isClientView?: boolean;
}

export default function ProjectDashboard({
    project,
    tasks,
    milestones,
    deliverables,
    changeRequests,
    tasksError,
    isClientView = false
}: ProjectDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'tasks', label: 'Tasks', icon: ListTodo },
        { id: 'milestones', label: 'Milestones', icon: Flag },
        { id: 'deliverables', label: 'Deliverables', icon: FolderOpen },
        { id: 'changes', label: 'Change Requests', icon: GitPullRequest },
    ];

    // Helper Functions for Overview
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const clientName = Array.isArray(project.clients) ? project.clients[0]?.business_name : project.clients?.business_name || "Unknown Client";
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Status color
    const statusColors: any = {
        not_started: "bg-gray-600 text-gray-200",
        in_progress: "bg-[#42CA80] text-white",
        on_hold: "bg-yellow-600 text-white",
        completed: "bg-blue-600 text-white",
        cancelled: "bg-red-600 text-white"
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] px-4 py-6">
            <div className="mx-auto max-w-6xl">
                {/* Header Section */}
                <div className="mb-6">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[#a1a1aa] transition-colors hover:text-[#42CA80] mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Projects</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white md:text-3xl">{clientName}</h1>
                            <p className="mt-1 text-[#a1a1aa]">{project.service_type?.replace(/_/g, ' ') || 'Project'}</p>
                        </div>
                        <span className={clsx("self-start px-3 py-1 rounded-full text-sm font-medium", statusColors[project.status] || statusColors.not_started)}>
                            {project.status?.replace(/_/g, ' ')}
                        </span>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto border-b border-[#1a1a1a] mb-6 no-scrollbar">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                                    activeTab === tab.id
                                        ? "border-[#42CA80] text-[#42CA80]"
                                        : "border-transparent text-[#666] hover:text-white"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="min-h-[500px]">
                    {activeTab === 'overview' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                            {/* Project Info Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#252525]">
                                    <div className="flex items-center gap-2 text-[#666] mb-2 text-xs uppercase tracking-wider">
                                        <Calendar className="h-4 w-4" /> Start Date
                                    </div>
                                    <p className="font-semibold text-white">{formatDate(project.start_date)}</p>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#252525]">
                                    <div className="flex items-center gap-2 text-[#666] mb-2 text-xs uppercase tracking-wider">
                                        <Clock className="h-4 w-4" /> Deadline
                                    </div>
                                    <p className="font-semibold text-white">{formatDate(project.deadline)}</p>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#252525]">
                                    <div className="flex items-center gap-2 text-[#666] mb-2 text-xs uppercase tracking-wider">
                                        <Briefcase className="h-4 w-4" /> Progress
                                    </div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white font-semibold">{progress}%</span>
                                        <span className="text-xs text-[#666]">{completedTasks}/{totalTasks} tasks</span>
                                    </div>
                                    <div className="h-1.5 bg-[#0f0f0f] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#42CA80]" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#252525]">
                                    <div className="flex items-center gap-2 text-[#666] mb-2 text-xs uppercase tracking-wider">
                                        <Users className="h-4 w-4" /> Client
                                    </div>
                                    <p className="font-semibold text-white truncate">{project.clients?.primary_email}</p>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="rounded-xl border border-[#1a1a1a] bg-[#1a1a1a] p-6">
                                <h2 className="mb-4 text-lg font-bold text-white">Recent Activity</h2>
                                <ActivityTimeline entityType="project" entityId={project.id} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <TaskManager initialTasks={tasks} projectId={project.id} tasksError={tasksError} />
                        </div>
                    )}

                    {activeTab === 'milestones' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <MilestoneManager projectId={project.id} initialMilestones={milestones} isClientView={isClientView} />
                        </div>
                    )}

                    {activeTab === 'deliverables' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <DeliverableManager projectId={project.id} initialDeliverables={deliverables} isClientView={isClientView} />
                        </div>
                    )}

                    {activeTab === 'changes' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <ChangeRequestBoard projectId={project.id} initialRequests={changeRequests} isClientView={isClientView} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
