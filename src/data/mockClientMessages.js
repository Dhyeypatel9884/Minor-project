export const mockClientConversations = [
  {
    id: 'conv_1',
    studentName: 'Dhyey Patel',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dhyey',
    projectId: 1,
    projectTitle: 'Design a New Logo for Student Union',
    lastMessage: 'I have updated the design as per our discussion.',
    timestamp: '10:30 AM',
    messages: [
      { id: 1, sender: 'student', text: 'Hi! I have some initial logo concepts ready.', time: '09:00 AM' },
      { id: 2, sender: 'client', text: 'Great! Can you share them here?', time: '09:15 AM' },
      { id: 3, sender: 'student', text: 'I have updated the design as per our discussion.', time: '10:30 AM' }
    ]
  },
  {
    id: 'conv_2',
    studentName: 'Rushi Patel',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rushi',
    projectId: 3,
    projectTitle: 'Build a Portfolio Website',
    lastMessage: 'Will the website be responsive on tablets too?',
    timestamp: 'Yesterday',
    messages: [
      { id: 1, sender: 'client', text: 'Hi Rushi, any updates on the portfolio layout?', time: 'Wed, 2:00 PM' },
      { id: 2, sender: 'student', text: 'Yes, almost done with the mobile version.', time: 'Wed, 4:30 PM' },
      { id: 3, sender: 'client', text: 'Will the website be responsive on tablets too?', time: 'Yesterday' }
    ]
  },
  {
    id: 'conv_3',
    studentName: 'Sagar Maan',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sagar',
    projectId: 2,
    projectTitle: 'Write Articles for Campus Blog',
    lastMessage: 'I will submit the draft by tonight.',
    timestamp: '2 days ago',
    messages: [
      { id: 1, sender: 'client', text: 'How is the article on finals week coming along?', time: '2 days ago' },
      { id: 2, sender: 'student', text: 'I will submit the draft by tonight.', time: '2 days ago' }
    ]
  }
];
