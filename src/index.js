(function () {
  if (!document.location.href.match(/^https?:\/\/analytics\.twitter\.com/)) {
    return;
  }

  Date.prototype.getYearMonth = function (slash) {
    if (!slash) {
      slash = false;
    }
    year = this.getFullYear();
    month = ('00' + (this.getMonth() + 1)).slice(-2);
    return slash ? (year + '/' + month) : parseInt(year + month);
  };

  today = new Date();
  since = window.prompt('いつ以降のデータを取得しますか？ (YYYY/MM)', today.getYearMonth(true));

  if (!since) {
    return;
  }

  sinceDate = new Date(since + '/1');

  // 少なくとも目的の年月までスクロール.
  timer = setInterval(function () {
    document.querySelector('html,body').scrollTop = document.querySelector('html,body').scrollHeight;

    blocks = document.querySelectorAll('.home-page');
    oldestTimestamp = blocks[blocks.length - 1].getAttribute('data-start');
    oldestDate = new Date(parseInt(oldestTimestamp));

    // スクロール停止後にまとめてデータ収集.
    if (oldestDate.getYearMonth() <= sinceDate.getYearMonth() || oldestDate.getYearMonth() <= 201409) {
      clearInterval(timer);

      blocks = document.querySelectorAll('.home-page');

      table = [
        ['年月', 'ツイート', 'ツイートインプレッション', 'プロフィールへのアクセス', '@ツイート', '新しいフォロワー'],
      ];

      blocks.forEach(function (elem) {
        timestamp = elem.getAttribute('data-start');
        date = new Date(parseInt(timestamp));

        // 目的の年月より前は無視.
        if (date.getYearMonth() < sinceDate.getYearMonth()) {
          return false;
        }

        tweetsElem = elem.querySelector('.metric-tweets');
        impressionsElem = elem.querySelector('.metric-tweetviews');
        profileViewsElem = elem.querySelector('.metric-profile-views');
        mentionsElem = elem.querySelector('.metric-mentions');
        newFollowersElem = elem.querySelector('.metric-followers');

        tweets = tweetsElem ? tweetsElem.textContent.replace(',', '') : '';
        impressions = impressionsElem ? impressionsElem.textContent.replace(',', '') : '';
        profileViews = profileViewsElem ? profileViewsElem.textContent.replace(',', '') : '';
        mentions = mentionsElem ? mentionsElem.textContent.replace(',', '') : '';
        newFollowers = newFollowersElem ? newFollowersElem.textContent.replace(',', '') : '';

        table.push([date.getYearMonth(true), tweets, impressions, profileViews, mentions, newFollowers]);
      });

      tsv = '';
      table.forEach(function (row) {
        tsv += row.join('\t') + '\n';
      });

      w = window.open('', '', 'height=500, width=800');
      if (!w) {
        alert('ポップアップがブロックされました。ポップアップを許可してから再度実行してください。');
      } else {
        w.document.open();
        w.document.write('<pre>' + tsv + '</pre>');
        w.document.close();
      }
    }
  }, 500);
})();
