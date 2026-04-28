"use client";

export const API_URLs = {
  register: "/register",
  login: "/login",
  logout: "/logout",
  googleLogin: "/google-login",
  verifyEmail: "/verify-email",
  commonCategoryAll: "/common/get-list-category",
  commonQuestionFindById: "/common/questions-list",
  questionDetails: "/common/question",
  userBalance: "/user/balance",
  ordersQuoteDetails: "/orders/quote-buy",
  quoteByBudget: "/orders/quote-by-budget",
  submitOrder: "/orders/submit-order",
  graphData: "/common/markets",
  commonQuoteSell: "/orders/quote-sell",
  leaderBoardMarketList: "/user/leaderboard/market",
  getOrders: "/orders",
  cancelOrders: "/orders",
  userDetails: "/user",
  userPositions: "/user/positions",
  // user post feedback/delete/get
  getFeed: "/user/get-posts",
  userPost: "/user/post",
  imageUpload: "/upload/images",
  likeOrUnlike: "/user/like-or-unlike",
  bookmarkOrUnBookMark: "/user/bookmark-or-unbookmark",
  bookMarkList: "/user/bookmarks",
  followUser: "/user/follow",
  unFollowUser: "/user/unfollow",
  getComments: "/user/comments",
  postComments: "/user/comment",
  getProfileListAllUser: "/user/get-social-user-profile",
  currentBalanceShares: "/user/current-balance",
  currentPositionShares: "/user/current-position-share",
  profileUpdate: "/user/update-user-profile",
  ordersTpAndSl: "/orders/submit-tpsl",
  subCategory: "/common/get-sub-catagory",
  questionBookMark: "/user/question-bookmark-or-unbookmark",
  userCommentLikeOrUnlike: "/user/comment-like-or-unlike",
  getWatchList: "/user/get-question-bookmarks",
  getNotification: "/user/notifications",
  getUnReadCountNotification: "/user/notifications/unread-count",
  readNotification: "/user/notifications/read",
  allReadNotification: "/user/notifications/all-read",
  myAllPost: "/user/my-feed",
  userSearch: "/user/search-users",
  feedDetailsById: "/user/feed-by-id",
  follow: "/user",
  feedForFollowingList: "/user/feed",

  // Reels
  reelsFeed: "/reels/feed",
  reelCreate: "/reels",
  reelById: "/reels", // GET /reels/:id
  reelsByQuestion: "/reels/question", // GET /reels/question/:questionId
  reelsByUser: "/reels/user", // GET /reels/user/:userId
  reelDelete: "/reels", // DELETE /reels/:id
  reelLike: "/reels", // POST /reels/:id/like
  reelBookmark: "/reels", // POST /reels/:id/bookmark
  reelComments: "/reels", // GET/POST /reels/:id/comments
  reelCommentDelete: "/reels/comments", // DELETE /reels/comments/:commentId
  reelView: "/reels", // POST /reels/:id/view
  reelBookmarks: "/reels/me/bookmarks",

  // Tracker
  trackerDashboard: "/tracker/dashboard",

  //  new api start
  countriesList: "/g/countries",
  statesList: "/g/states",
  citiesList: "/g/cities",
  getResponser: "/user/get_sponser",
  userAddBalance: "user/add-balance",
  userUpdateBalance: "user/update-add-balance",
  userAddBalanceWithQr: "user/add-balance-with-qr",
  topTenUser: "user/top-ten-user",
  categoryWithQuestions: "user/categories-with-question",
};
