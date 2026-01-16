import { RenewalCycle, SlackActionId, UsageResponseType } from '@/src/types/enums';
import type { Subscription } from '@/src/modules/subscription/domain/Subscription';
import type { UsageResponse } from '@/src/modules/usage-tracking/domain/UsageResponse';
import type { SlackSubscriptionData } from '@/src/types/slack';

export class SlackMessageBuilder {
  buildHelpMessage() {
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: ':t-rex: Dino\'s Command Menu! 🦖',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*`/subsaurus help`*\n_Show this fancy menu again (because you forgot already, didn\'t you?)_ :wink:',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*`/subsaurus create`*\n_Birth a new subscription into existence!_ :sparkles: _The dino will track it like a hawk... or like a dino!_ :eyes:',
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: ':construction: _More epic commands cooking in the lab... Stay tuned!_ :microscope::fire:',
            },
          ],
        },
      ],
    };
  }

  buildErrorMessage(error: string) {
    return {
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:boom: *Oopsie Daisy!*\n\nThe dino tripped over its tail... :t-rex::sweat_smile:\n\n_Error details:_ ${error}\n\n_Try again? The dino believes in you!_ :muscle:`,
          },
        },
      ],
    };
  }

  buildCreateSubscriptionModal() {
    return {
      type: 'modal',
      callback_id: 'create_subscription_modal',
      title: {
        type: 'plain_text',
        text: 'Create Subscription',
      },
      submit: {
        type: 'plain_text',
        text: 'Create',
      },
      close: {
        type: 'plain_text',
        text: 'Cancel',
      },
      blocks: [
        {
          type: 'input',
          block_id: 'name_block',
          element: {
            type: 'plain_text_input',
            action_id: 'name_input',
            placeholder: {
              type: 'plain_text',
              text: 'e.g., Netflix Premium',
            },
          },
          label: {
            type: 'plain_text',
            text: 'Subscription Name',
          },
        },
        {
          type: 'input',
          block_id: 'price_block',
          element: {
            type: 'plain_text_input',
            action_id: 'price_input',
            placeholder: {
              type: 'plain_text',
              text: 'e.g., 15.99',
            },
          },
          label: {
            type: 'plain_text',
            text: 'Price',
          },
        },
        {
          type: 'input',
          block_id: 'currency_block',
          element: {
            type: 'static_select',
            action_id: 'currency_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select currency',
            },
            initial_option: {
              text: {
                type: 'plain_text',
                text: 'EUR (€)',
              },
              value: 'EUR',
            },
            options: [
              {
                text: {
                  type: 'plain_text',
                  text: 'EUR (€)',
                },
                value: 'EUR',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'USD ($)',
                },
                value: 'USD',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'GBP (£)',
                },
                value: 'GBP',
              },
            ],
          },
          label: {
            type: 'plain_text',
            text: 'Currency',
          },
        },
        {
          type: 'input',
          block_id: 'renewal_cycle_block',
          element: {
            type: 'static_select',
            action_id: 'renewal_cycle_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select renewal period',
            },
            initial_option: {
              text: {
                type: 'plain_text',
                text: 'Monthly',
              },
              value: 'MONTHLY',
            },
            options: [
              {
                text: {
                  type: 'plain_text',
                  text: 'Monthly',
                },
                value: 'MONTHLY',
              },
              {
                text: {
                  type: 'plain_text',
                  text: 'Yearly',
                },
                value: 'YEARLY',
              },
            ],
          },
          label: {
            type: 'plain_text',
            text: 'Renewal Period',
          },
        },
        {
          type: 'input',
          block_id: 'date_block',
          element: {
            type: 'datepicker',
            action_id: 'date_input',
            placeholder: {
              type: 'plain_text',
              text: 'Select renewal date',
            },
          },
          label: {
            type: 'plain_text',
            text: 'Renewal Date',
          },
        },
        {
          type: 'input',
          block_id: 'users_block',
          optional: true,
          element: {
            type: 'multi_users_select',
            action_id: 'users_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select users (optional)',
            },
          },
          label: {
            type: 'plain_text',
            text: 'Users',
          },
        },
        {
          type: 'input',
          block_id: 'projects_block',
          optional: true,
          element: {
            type: 'plain_text_input',
            action_id: 'projects_input',
            placeholder: {
              type: 'plain_text',
              text: 'e.g., Project Alpha, Project Beta',
            },
            multiline: false,
          },
          label: {
            type: 'plain_text',
            text: 'Projects',
          },
          hint: {
            type: 'plain_text',
            text: 'Separate multiple projects with commas',
          },
        },
      ],
    };
  }

  buildSuccessModal(subscription: SlackSubscriptionData) {
    const currencySymbol =
      subscription.currency === 'EUR'
        ? '€'
        : subscription.currency === 'USD'
          ? '$'
          : subscription.currency === 'GBP'
            ? '£'
            : subscription.currency;

    const renewalCycleText =
      subscription.renewalCycle === 'MONTHLY'
        ? 'Monthly'
        : subscription.renewalCycle === 'YEARLY'
          ? 'Yearly'
          : 'Custom';

    const fields = [
      {
        type: 'mrkdwn',
        text: `*Name:*\n${subscription.name}`,
      },
      {
        type: 'mrkdwn',
        text: `*Price:*\n${currencySymbol}${subscription.price}`,
      },
      {
        type: 'mrkdwn',
        text: `*Period:*\n${renewalCycleText}`,
      },
      {
        type: 'mrkdwn',
        text: `*Renewal Date:*\n${subscription.renewalDate}`,
      },
    ];

    if (subscription.users.length > 0) {
      fields.push({
        type: 'mrkdwn',
        text: `*Users:*\n${subscription.users.length} selected`,
      });
    }

    if (subscription.projects.length > 0) {
      fields.push({
        type: 'mrkdwn',
        text: `*Projects:*\n${subscription.projects.join(', ')}`,
      });
    }

    return {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Success!',
      },
      close: {
        type: 'plain_text',
        text: 'Close',
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':white_check_mark: *Subscription created successfully!*',
          },
        },
        {
          type: 'section',
          fields: fields,
        },
      ],
    };
  }

  buildUsageCheckMessage(
    usageCheckId: number,
    subscriptionName: string,
    renewalCycle: RenewalCycle
  ) {
    const period =
      renewalCycle === RenewalCycle.MONTHLY
        ? 'month'
        : renewalCycle === RenewalCycle.YEARLY
          ? 'year'
          : 'period';

    const funnyIntro =
      renewalCycle === RenewalCycle.MONTHLY
        ? "Whoosh! :dash: Another month flew by faster than a pizza disappearing at a tech meetup!"
        : 'Holy guacamole! :taco: A whole year has passed! (Did you age or did we? :thinking_face:)';

    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: ':t-rex: Dino\'s Got Questions! 🤔',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${funnyIntro}\n\n*${subscriptionName}* is about to renew and honestly... :drum_with_drumsticks:`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:eyes: *Real talk:* Did you ACTUALLY use this ${period === 'month' ? 'this past month' : 'this past year'}?\n\n_Be honest, the dino can smell lies... and also cookies._ :cookie::t-rex:`,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Yes! :muscle:',
                emoji: true,
              },
              style: 'primary',
              value: `${usageCheckId}|YES`,
              action_id: SlackActionId.USAGE_RESPONSE_YES,
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'A Little :shrug:',
                emoji: true,
              },
              value: `${usageCheckId}|LITTLE`,
              action_id: SlackActionId.USAGE_RESPONSE_LITTLE,
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Nope :see_no_evil:',
                emoji: true,
              },
              style: 'danger',
              value: `${usageCheckId}|NO`,
              action_id: SlackActionId.USAGE_RESPONSE_NO,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: ':sparkles: _Your honesty helps us save money and keep the dino fed! Win-win!_ :t-rex::moneybag:',
            },
          ],
        },
      ],
    };
  }

  buildRenewalNotificationMessage(
    subscriptionSummaries: Array<{
      subscription: Subscription;
      responses: UsageResponse[];
    }>
  ) {
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: ':rotating_light: TOMORROW IS THE DAY! :rotating_light:',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ":t-rex: *Attention humans!* :loudspeaker:\n\nThese subscriptions are renewing TOMORROW and the dino has been collecting intel on whether you actually use them... :female-detective:\n\n_Spoiler alert: Some of you might be busted!_ :eyes:",
        },
      },
      {
        type: 'divider',
      },
    ];

    for (const { subscription, responses } of subscriptionSummaries) {
      const yesCount = responses.filter(r => r.isPositive()).length;
      const noCount = responses.filter(r => r.isNegative()).length;
      const littleCount = responses.filter(r => r.isLittle()).length;
      const noResponseCount = responses.filter(r => !r.hasResponded()).length;
      const hasResponses = responses.some(r => r.hasResponded());

      const renewalCycleText =
        subscription.renewalCycle === RenewalCycle.MONTHLY
          ? 'Monthly'
          : subscription.renewalCycle === RenewalCycle.YEARLY
            ? 'Yearly'
            : 'Custom';

      const usageText = hasResponses
        ? `\n:white_check_mark: *Yes:* ${yesCount}\n:shrug: *A Little:* ${littleCount}\n:x: *No:* ${noCount}\n:question: *No Response:* ${noResponseCount}`
        : '\n_No usage responses collected_';

      blocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${subscription.name}*\n_${renewalCycleText} • Renews: ${subscription.renewalDate.toLocaleDateString()}_${usageText}`,
          },
        },
        {
          type: 'divider',
        }
      );
    }

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: ':tada: _Boom! All subscriptions rolled over like a good dog! Ready for another cycle!_ :t-rex::rocket:',
        },
      ],
    });

    return { blocks };
  }

  buildResponseConfirmation(responseType: UsageResponseType): string {
    const messages: Record<string, string> = {
      [UsageResponseType.YES]: "🎸 *ROCK ON!* The dino is happy you're using it! Keep crushing it! :t-rex::fire:",
      [UsageResponseType.NO]: "👀 *Oof!* Not using it, eh? The dino might have to eat this subscription... :t-rex::fork_and_knife:",
      [UsageResponseType.LITTLE]:
        '🤷 *Meh, barely using it?* Maybe we can find a cheaper plan or the dino might get hungry... :t-rex::thinking_face:',
    };
    return messages[responseType];
  }

  buildUserAssignmentRequestMessage(subscriptionId: number, subscriptionName: string) {
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: ':t-rex: Mystery Subscription Alert! 🕵️',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `We found *${subscriptionName}* wandering around like a lost puppy... :eyes:\n\nNobody's claimed it yet and it's feeling lonely! :cry:`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Plot twist:* Is this YOUR subscription? :scream:\n\n_Help the dino solve this mystery!_ :mag:',
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Yep, that\'s mine! 🙋',
                emoji: true,
              },
              style: 'primary',
              value: `${subscriptionId}|YES`,
              action_id: SlackActionId.USER_ASSIGNMENT_YES,
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Nope, not me! 🤷',
                emoji: true,
              },
              value: `${subscriptionId}|NO`,
              action_id: SlackActionId.USER_ASSIGNMENT_NO,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: ':sparkles: _If it\'s yours, you\'ll automagically get added and we\'ll ping you before renewals!_',
            },
          ],
        },
      ],
    };
  }

  buildUserAssignmentConfirmation(subscriptionName: string, wasAssigned: boolean): string {
    if (wasAssigned) {
      return `🎉 *BOOM!* You're now the proud owner of *${subscriptionName}*! 🏆\n\nThe dino will keep you posted on renewals and stuff. No worries! :t-rex::sunglasses:`;
    } else {
      return `👌 *Cool cool cool!* Not your subscription, noted! :memo:\n\nThe mystery continues... :mag: We'll find who this *${subscriptionName}* belongs to!`;
    }
  }
}

