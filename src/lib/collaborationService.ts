import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  getDoc,
  getDocs,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

// ===== INTERFACES =====
export interface DesignComment {
  id: string;
  designId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'comment' | 'review' | 'approval' | 'rejection';
  status: 'pending' | 'resolved' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  position?: {
    x: number;
    y: number;
    elementId?: string;
  };
  attachments?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
  resolvedBy?: string;
  tags: string[];
  mentions: string[];
}

export interface DesignVersion {
  id: string;
  designId: string;
  versionNumber: number;
  versionName: string;
  description: string;
  changes: string[];
  createdBy: string;
  createdAt: Timestamp;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  metadata: {
    fileSize: number;
    fileType: string;
    dimensions?: {
      width: number;
      height: number;
    };
    layers?: number;
    components?: number;
  };
}

export interface ApprovalWorkflow {
  id: string;
  designId: string;
  workflowName: string;
  steps: ApprovalStep[];
  currentStep: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  totalSteps: number;
  completedSteps: number;
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  stepName: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  required: boolean;
  deadline?: Timestamp;
  completedAt?: Timestamp;
  comments?: string;
  attachments?: string[];
}

export interface CollaborationSession {
  id: string;
  designId: string;
  sessionName: string;
  participants: string[];
  activeUsers: string[];
  status: 'active' | 'paused' | 'ended';
  startedAt: Timestamp;
  lastActivity: Timestamp;
  duration: number; // in minutes
  notes: string;
  recordings?: string[];
}

// ===== COLLABORATION SERVICE =====
export class CollaborationService {
  private static instance: CollaborationService;

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  // ===== COMMENTS MANAGEMENT =====
  async addComment(
    comment: Omit<DesignComment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const commentData = {
        ...comment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'designComments'), commentData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  async updateComment(commentId: string, updates: Partial<DesignComment>): Promise<void> {
    try {
      const commentRef = doc(db, 'designComments', commentId);
      await updateDoc(commentRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      throw new Error('Failed to update comment');
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'designComments', commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error('Failed to delete comment');
    }
  }

  async resolveComment(commentId: string, resolvedBy: string): Promise<void> {
    try {
      const commentRef = doc(db, 'designComments', commentId);
      await updateDoc(commentRef, {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        resolvedBy,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error resolving comment:', error);
      throw new Error('Failed to resolve comment');
    }
  }

  getCommentsRealtime(designId: string, callback: (comments: DesignComment[]) => void): () => void {
    const q = query(
      collection(db, 'designComments'),
      where('designId', '==', designId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const comments: DesignComment[] = [];
      snapshot.forEach(doc => {
        comments.push({ id: doc.id, ...doc.data() } as DesignComment);
      });
      callback(comments);
    });

    return unsubscribe;
  }

  // ===== VERSIONING MANAGEMENT =====
  async createVersion(version: Omit<DesignVersion, 'id' | 'createdAt'>): Promise<string> {
    try {
      const versionData = {
        ...version,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'designVersions'), versionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating version:', error);
      throw new Error('Failed to create version');
    }
  }

  async updateVersion(versionId: string, updates: Partial<DesignVersion>): Promise<void> {
    try {
      const versionRef = doc(db, 'designVersions', versionId);
      await updateDoc(versionRef, updates);
    } catch (error) {
      console.error('Error updating version:', error);
      throw new Error('Failed to update version');
    }
  }

  async approveVersion(versionId: string, approvedBy: string): Promise<void> {
    try {
      const versionRef = doc(db, 'designVersions', versionId);
      await updateDoc(versionRef, {
        status: 'approved',
        approvedBy,
        approvedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error approving version:', error);
      throw new Error('Failed to approve version');
    }
  }

  async rejectVersion(versionId: string, rejectionReason: string): Promise<void> {
    try {
      const versionRef = doc(db, 'designVersions', versionId);
      await updateDoc(versionRef, {
        status: 'rejected',
        rejectionReason,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error rejecting version:', error);
      throw new Error('Failed to reject version');
    }
  }

  getVersionsRealtime(designId: string, callback: (versions: DesignVersion[]) => void): () => void {
    const q = query(
      collection(db, 'designVersions'),
      where('designId', '==', designId),
      orderBy('versionNumber', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const versions: DesignVersion[] = [];
      snapshot.forEach(doc => {
        versions.push({ id: doc.id, ...doc.data() } as DesignVersion);
      });
      callback(versions);
    });

    return unsubscribe;
  }

  async getNextVersionNumber(designId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'designVersions'),
        where('designId', '==', designId),
        orderBy('versionNumber', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return 1;
      }

      const lastVersion = snapshot.docs[0]?.data() as DesignVersion;
      return (lastVersion?.versionNumber || 0) + 1;
    } catch (error) {
      console.error('Error getting next version number:', error);
      return 1;
    }
  }

  // ===== APPROVAL WORKFLOW =====
  async createWorkflow(
    workflow: Omit<
      ApprovalWorkflow,
      'id' | 'createdAt' | 'updatedAt' | 'totalSteps' | 'completedSteps'
    >
  ): Promise<string> {
    try {
      const workflowData = {
        ...workflow,
        totalSteps: workflow.steps.length,
        completedSteps: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'approvalWorkflows'), workflowData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw new Error('Failed to create workflow');
    }
  }

  async updateWorkflowStep(
    workflowId: string,
    stepNumber: number,
    updates: Partial<ApprovalStep>
  ): Promise<void> {
    try {
      const workflowRef = doc(db, 'approvalWorkflows', workflowId);
      const workflowDoc = await getDoc(workflowRef);

      if (!workflowDoc.exists()) {
        throw new Error('Workflow not found');
      }

      const workflow = workflowDoc.data() as ApprovalWorkflow;
      const updatedSteps = workflow.steps.map(step =>
        step.stepNumber === stepNumber ? { ...step, ...updates } : step
      );

      const completedSteps = updatedSteps.filter(
        step => step.status === 'approved' || step.status === 'skipped'
      ).length;

      const currentStep =
        completedSteps < workflow.totalSteps ? completedSteps + 1 : workflow.totalSteps;
      const status = completedSteps === workflow.totalSteps ? 'completed' : 'active';

      await updateDoc(workflowRef, {
        steps: updatedSteps,
        completedSteps,
        currentStep,
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'completed' && { completedAt: serverTimestamp() }),
      });
    } catch (error) {
      console.error('Error updating workflow step:', error);
      throw new Error('Failed to update workflow step');
    }
  }

  getWorkflowRealtime(
    workflowId: string,
    callback: (workflow: ApprovalWorkflow | null) => void
  ): () => void {
    const workflowRef = doc(db, 'approvalWorkflows', workflowId);

    const unsubscribe = onSnapshot(workflowRef, doc => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as ApprovalWorkflow);
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }

  // ===== COLLABORATION SESSIONS =====
  async startSession(
    session: Omit<CollaborationSession, 'id' | 'startedAt' | 'lastActivity' | 'duration'>
  ): Promise<string> {
    try {
      const sessionData = {
        ...session,
        startedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        duration: 0,
      };

      const docRef = await addDoc(collection(db, 'collaborationSessions'), sessionData);
      return docRef.id;
    } catch (error) {
      console.error('Error starting session:', error);
      throw new Error('Failed to start session');
    }
  }

  async updateSessionActivity(sessionId: string, userId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'collaborationSessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }

      const session = sessionDoc.data() as CollaborationSession;
      const now = Timestamp.now();
      const duration = Math.floor((now.toMillis() - session.startedAt.toMillis()) / (1000 * 60));

      let activeUsers = session.activeUsers;
      if (!activeUsers.includes(userId)) {
        activeUsers = [...activeUsers, userId];
      }

      await updateDoc(sessionRef, {
        lastActivity: now,
        duration,
        activeUsers,
      });
    } catch (error) {
      console.error('Error updating session activity:', error);
      throw new Error('Failed to update session activity');
    }
  }

  async endSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = doc(db, 'collaborationSessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'ended',
        lastActivity: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error ending session:', error);
      throw new Error('Failed to end session');
    }
  }

  getSessionsRealtime(
    designId: string,
    callback: (sessions: CollaborationSession[]) => void
  ): () => void {
    const q = query(
      collection(db, 'collaborationSessions'),
      where('designId', '==', designId),
      orderBy('startedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const sessions: CollaborationSession[] = [];
      snapshot.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() } as CollaborationSession);
      });
      callback(sessions);
    });

    return unsubscribe;
  }

  // ===== UTILITY METHODS =====
  async getDesignCollaborationStats(designId: string): Promise<{
    totalComments: number;
    pendingComments: number;
    totalVersions: number;
    activeWorkflows: number;
    activeSessions: number;
  }> {
    try {
      const [commentsSnapshot, versionsSnapshot, workflowsSnapshot, sessionsSnapshot] =
        await Promise.all([
          getDocs(query(collection(db, 'designComments'), where('designId', '==', designId))),
          getDocs(query(collection(db, 'designVersions'), where('designId', '==', designId))),
          getDocs(
            query(
              collection(db, 'approvalWorkflows'),
              where('designId', '==', designId),
              where('status', '==', 'active')
            )
          ),
          getDocs(
            query(
              collection(db, 'collaborationSessions'),
              where('designId', '==', designId),
              where('status', '==', 'active')
            )
          ),
        ]);

      const pendingComments = commentsSnapshot.docs.filter(
        doc => doc.data().status === 'pending'
      ).length;

      return {
        totalComments: commentsSnapshot.size,
        pendingComments,
        totalVersions: versionsSnapshot.size,
        activeWorkflows: workflowsSnapshot.size,
        activeSessions: sessionsSnapshot.size,
      };
    } catch (error) {
      console.error('Error getting collaboration stats:', error);
      return {
        totalComments: 0,
        pendingComments: 0,
        totalVersions: 0,
        activeWorkflows: 0,
        activeSessions: 0,
      };
    }
  }

  async searchComments(designId: string, searchTerm: string): Promise<DesignComment[]> {
    try {
      const q = query(
        collection(db, 'designComments'),
        where('designId', '==', designId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const comments: DesignComment[] = [];

      snapshot.forEach(doc => {
        const comment = { id: doc.id, ...doc.data() } as DesignComment;
        if (
          comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        ) {
          comments.push(comment);
        }
      });

      return comments;
    } catch (error) {
      console.error('Error searching comments:', error);
      return [];
    }
  }
}

export default CollaborationService.getInstance();
