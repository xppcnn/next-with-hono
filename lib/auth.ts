import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { sendEmail } from "@/lib/email";
import {
  member,
  organization as organizationTable,
} from "@/db/schema/auth-schema";
import { eq, and } from "drizzle-orm";

// 获取用户的初始组织（优先 owner 的组织，否则返回第一个组织）
const getInitialOrganization = async (userId: string) => {
  // 先尝试获取 owner 的组织
  const oMember = await db
    .select()
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.role, "owner")))
    .limit(1);

  if (oMember.length > 0) {
    return oMember[0];
  }
  const userMember = await db
    .select()
    .from(member)
    .where(eq(member.userId, userId))
    .limit(1);

  return userMember[0] ?? null;
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // 设置初始活跃组织
          const userOrg = await getInitialOrganization(session.userId);
          console.log("🚀 ~ userOrg:", userOrg);
          return {
            data: {
              ...session,
              activeOrganizationId: userOrg?.organizationId,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }, request) => {
      // 不要等待邮件发送，以防止时序攻击
      void sendEmail({
        to: user.email,
        subject: "重置你的密码",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">密码重置请求</h2>
            <p style="color: #666; margin-bottom: 20px;">我们收到了你的密码重置请求。点击下方按钮重置你的密码。</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px; margin-bottom: 20px;">重置密码</a>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">或复制此链接：<br/>${url}</p>
            <p style="color: #999; font-size: 12px;">此链接将在24小时后失效。</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">如果你没有请求重置密码，请忽略此邮件。</p>
          </div>
        `,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }, request) => {
      // 不要等待邮件发送，以防止时序攻击
      void sendEmail({
        to: user.email,
        subject: "验证你的邮箱地址",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">邮箱验证</h2>
            <p style="color: #666; margin-bottom: 20px;">感谢你注册。请点击下方按钮验证你的邮箱地址。</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px; margin-bottom: 20px;">验证邮箱</a>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">或复制此链接：<br/>${url}</p>
            <p style="color: #999; font-size: 12px;">此链接将在1小时后失效。</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">如果你没有创建此账户，请忽略此邮件。</p>
          </div>
        `,
      });
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  basePath: "/api/auth",
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:6688"],
  plugins: [admin(), organization()],
});
