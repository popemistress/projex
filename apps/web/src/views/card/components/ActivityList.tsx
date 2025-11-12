import { formatDistanceToNow } from "date-fns";
import { enGB } from "date-fns/locale";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineTag,
  HiOutlineTrash,
  HiOutlineUserMinus,
  HiOutlineUserPlus,
} from "react-icons/hi2";

import type { GetCardByIdOutput } from "@kan/api/types";
import { authClient } from "@kan/auth/client";

import Avatar from "~/components/Avatar";
import Comment from "./Comment";

type ActivityType =
  NonNullable<GetCardByIdOutput>["activities"][number]["type"];

const truncate = (value: string | null, maxLength = 50) => {
  if (!value) return value;
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
};

const getActivityText = ({
  type,
  toTitle,
  fromList,
  toList,
  memberName,
  isSelf,
  label,
  fromTitle,
}: {
  type: ActivityType;
  toTitle: string | null;
  fromList: string | null;
  toList: string | null;
  memberName: string | null;
  isSelf: boolean;
  label: string | null;
  fromTitle?: string | null;
}) => {
  const ACTIVITY_TYPE_MAP = {
    "card.created": "created the card",
    "card.updated.title": "updated the title",
    "card.updated.description": "updated the description",
    "card.updated.list": "moved the card to another list",
    "card.updated.label.added": "added a label to the card",
    "card.updated.label.removed": "removed a label from the card",
    "card.updated.member.added": "added a member to the card",
    "card.updated.member.removed": "removed a member from the card",
    "card.updated.checklist.added": "added a checklist",
    "card.updated.checklist.renamed": "renamed a checklist",
    "card.updated.checklist.deleted": "deleted a checklist",
    "card.updated.checklist.item.added": "added a checklist item",
    "card.updated.checklist.item.updated": "updated a checklist item",
    "card.updated.checklist.item.completed": "completed a checklist item",
    "card.updated.checklist.item.uncompleted": "marked a checklist item as incomplete",
    "card.updated.checklist.item.deleted": "deleted a checklist item",
  } as const;

  if (!(type in ACTIVITY_TYPE_MAP)) return null;
  const baseText = ACTIVITY_TYPE_MAP[type as keyof typeof ACTIVITY_TYPE_MAP];

  const TextHighlight = ({ children }: { children: React.ReactNode }) => (
    <span className="font-medium text-light-1000 dark:text-dark-1000">
      {children}
    </span>
  );

  if (type === "card.updated.title" && toTitle) {
    return (
      <>
        updated the title to <TextHighlight>{truncate(toTitle)}</TextHighlight>
      </>
    );
  }

  if (type === "card.updated.list" && fromList && toList) {
    return (
      <>
        moved the card from <TextHighlight>{truncate(fromList)}</TextHighlight>{" "}
        to <TextHighlight>{truncate(toList)}</TextHighlight>
      </>
    );
  }

  if (type === "card.updated.member.added" && memberName) {
    if (isSelf) return "self-assigned the card";

    return (
      <>
        assigned <TextHighlight>{truncate(memberName)}</TextHighlight> to the card
      </>
    );
  }

  if (type === "card.updated.member.removed" && memberName) {
    if (isSelf) return "unassigned themselves from the card";

    return (
      <>
        unassigned <TextHighlight>{truncate(memberName)}</TextHighlight> from the card
      </>
    );
  }

  if (type === "card.updated.label.added" && label) {
    return (
      <>
        added label <TextHighlight>{truncate(label)}</TextHighlight>
      </>
    );
  }

  if (type === "card.updated.label.removed" && label) {
    return (
      <>
        removed label <TextHighlight>{truncate(label)}</TextHighlight>
      </>
    );
  }

  if (type === "card.updated.checklist.added" && toTitle) {
    return (
      <>
        added checklist <TextHighlight>{truncate(toTitle)}</TextHighlight>
      </>
    );
  }

  if (type === "card.updated.checklist.renamed" && toTitle) {
    return (
      <>
        renamed checklist <TextHighlight>{truncate(toTitle)}</TextHighlight>
      </>
    );
  }

  if (type === "card.updated.checklist.deleted" && fromTitle) {
    return (
      <>
        deleted checklist <TextHighlight>{truncate(fromTitle)}</TextHighlight>
      </>
    );
  }

  if (type === "card.updated.checklist.item.added" && toTitle) {
    return (
      <>
        added checklist item <TextHighlight>{truncate(toTitle)}</TextHighlight>
      </>
    );
  }

  if (type === "card.updated.checklist.item.updated" && toTitle) {
    return (
      <>
        renamed checklist item to{" "}
        <TextHighlight>{truncate(toTitle)}</TextHighlight>
      </>
    );
  }

  if (type === "card.updated.checklist.item.completed" && toTitle) {
    return (
      <>
        completed checklist item{" "}
        <TextHighlight>{truncate(toTitle)}</TextHighlight>
      </>
    );
  }

  if (type === "card.updated.checklist.item.uncompleted" && toTitle) {
    return (
      <>
        marked checklist item <TextHighlight>{truncate(toTitle)}</TextHighlight>{" "}
        as incomplete
      </>
    );
  }

  if (type === "card.updated.checklist.item.deleted" && fromTitle) {
    return (
      <>
        deleted checklist item{" "}
        <TextHighlight>{truncate(fromTitle)}</TextHighlight>
      </>
    );
  }

  return baseText;
};

const ACTIVITY_ICON_MAP: Partial<Record<ActivityType, React.ReactNode | null>> =
  {
    "card.created": <HiOutlinePlus />,
    "card.updated.title": <HiOutlinePencil />,
    "card.updated.description": <HiOutlinePencil />,
    "card.updated.label.added": <HiOutlineTag />,
    "card.updated.label.removed": <HiOutlineTag />,
    "card.updated.member.added": <HiOutlineUserPlus />,
    "card.updated.member.removed": <HiOutlineUserMinus />,
    "card.updated.checklist.added": <HiOutlinePlus />,
    "card.updated.checklist.renamed": <HiOutlinePencil />,
    "card.updated.checklist.deleted": <HiOutlineTrash />,
    "card.updated.checklist.item.added": <HiOutlinePlus />,
    "card.updated.checklist.item.updated": <HiOutlinePencil />,
    "card.updated.checklist.item.completed": <HiOutlineCheckCircle />,
    "card.updated.checklist.item.uncompleted": <HiOutlineCheckCircle />,
    "card.updated.checklist.item.deleted": <HiOutlineTrash />,
  } as const;

const getActivityIcon = (
  type: ActivityType,
  fromIndex?: number | null,
  toIndex?: number | null,
): React.ReactNode | null => {
  if (type === "card.updated.list" && fromIndex != null && toIndex != null) {
    return fromIndex > toIndex ? (
      <HiOutlineArrowLeft />
    ) : (
      <HiOutlineArrowRight />
    );
  }
  return ACTIVITY_ICON_MAP[type] ?? null;
};

const ActivityList = ({
  activities,
  cardPublicId,
  isLoading,
  isAdmin,
  isViewOnly,
}: {
  activities: NonNullable<GetCardByIdOutput>["activities"];
  cardPublicId: string;
  isLoading: boolean;
  isAdmin?: boolean;
  isViewOnly?: boolean;
}) => {
  const { data } = authClient.useSession();

  return (
    <div className="flex flex-col space-y-4 pt-4">
      {activities.map((activity, index) => {
        const activityText = getActivityText({
          type: activity.type,
          toTitle: activity.toTitle,
          fromList: activity.fromList?.name ?? null,
          toList: activity.toList?.name ?? null,
          memberName: activity.member?.user?.name ?? null,
          isSelf: activity.member?.user?.id === data?.user.id,
          label: activity.label?.name ?? null,
          fromTitle: activity.fromTitle ?? null,
        });

        if (activity.type === "card.updated.comment.added")
          return (
            <Comment
              key={activity.publicId}
              publicId={activity.comment?.publicId}
              cardPublicId={cardPublicId}
              name={activity.user?.name ?? ""}
              email={activity.user?.email ?? ""}
              isLoading={isLoading}
              createdAt={activity.createdAt.toISOString()}
              comment={activity.comment?.comment}
              isEdited={!!activity.comment?.updatedAt}
              isAuthor={activity.comment?.createdBy === data?.user.id}
              isAdmin={isAdmin ?? false}
              isViewOnly={!!isViewOnly}
            />
          );

        if (!activityText) return null;

        return (
          <div
            key={activity.publicId}
            className="relative flex items-center space-x-2"
          >
            <div className="relative">
              <Avatar
                size="sm"
                name={activity.user?.name ?? ""}
                email={activity.user?.email ?? ""}
                icon={getActivityIcon(
                  activity.type,
                  activity.fromList?.index,
                  activity.toList?.index,
                )}
                isLoading={isLoading}
              />
              {index !== activities.length - 1 &&
                activities[index + 1]?.type !==
                  "card.updated.comment.added" && (
                  <div className="absolute bottom-[-14px] left-1/2 top-[30px] w-0.5 -translate-x-1/2 bg-light-600 dark:bg-dark-600" />
                )}
            </div>
            <p className="text-sm">
              <span className="font-medium dark:text-dark-1000">{`${activity.user?.name} `}</span>
              <span className="space-x-1 text-light-900 dark:text-dark-800">
                {activityText}
              </span>
              <span className="mx-1 text-light-900 dark:text-dark-800">·</span>
              <span className="space-x-1 text-light-900 dark:text-dark-800">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                  locale: enGB,
                })}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityList;
