function Disqium(scope) {
    var $scope = $(scope);

    $scope.addClass('disqium-container');

    var DisqusAPI = (function() {

        return {
            threads: {
                list: function list(identifiers, cursor) {
                    var params = {
                        cursor: cursor,
                        limit: 100,
                        thread: identifiers.map(function(identifier) {
                            return 'ident:' + identifier;
                        })
                    };
                    var url = '/disqus/threads/list?' + $.param(params);
                    return $.ajax({ url: url, type: 'GET' }).then(function(response) {
                        var threads = response.response;
                        if(response.cursor.hasNext) {
                            return list(identifiers, response.cursor.next).then(function(more) {
                                return threads.concat(more);
                            });
                        } else {
                            return $.when(threads);
                        }
                    });
                },
                create: function(title, identifier) {
                    var thread = {
                        title: title,
                        identifier: identifier
                    };
                    var url = '/disqus/threads/create';
                    return $.ajax({ url: url, type: 'POST', data: thread });
                },
                details: function(identifier) {
                    var params = {
                        'thread:ident': identifier
                    };
                    var url = '/disqus/threads/details?' + $.param(params);
                    return $.ajax({ url: url, type: 'GET' });
                }
            },
            posts: {
                list: function list(threadIds, cursor) {
                    var params = {
                        cursor: cursor,
                        limit: 100,
                        thread: threadIds,
                        order: 'asc'
                    };

                    var url = '/disqus/posts/list?' + $.param(params);
                    return $.ajax({ url: url, type: 'GET' }).then(function(response) {
                        var posts = response.response;
                        if(response.cursor.hasNext) {
                            return list(threadIds, response.cursor.next).then(function(more) {
                                return posts.concat(more);
                            });
                        } else {
                            return $.when(posts);
                        }
                    });
                },
                create: function(authorName, authorEmail, message, threadId) {
                    var post = {
                        author_name: authorName,
                        author_email: authorEmail,
                        message: message,
                        thread: threadId
                    };
                    var url = '/disqus/posts/create?' + $.param(post);
                    return $.ajax({ url: url, type: 'POST', data: post});
                }
            }
        };
    })();

    var identifiers = $scope.find('[data-disqium-thread-id]').map(function() {
        return $(this).data('disqium-thread-id');
    }).toArray();

    var eventuallyThreads = DisqusAPI.threads.list(identifiers).then(function(threads) {
        var threadIds = threads.map(function(thread) { return thread.id; });
        return DisqusAPI.posts.list(threadIds).then(function(posts) {
            return threads.reduce(function(acc, thread) {
                var identifier = thread.identifiers[0];
                acc[identifier] = {
                    id: thread.id,
                    posts: posts.filter(function(post) {
                        return post.thread == thread.id && post.isApproved && !post.isDeleted;
                    })
                };
                return acc;
            }, {});
        });
    });

    var formatPostDate = function(date) {
        var MONTHS = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        var day = date.getDay();
        var month = MONTHS[date.getMonth()];
        var year = date.getFullYear();

        return day + ' ' + month + ' ' + year;
    };

    var renderPost = function(post) {
        var author = post.author;
        return '<li class="disqium-post">\
                  <div>\
                    <span class="disqium-post-author">'+ author.name +'</span>\
                    <span class="disqium-post-createdat">'+ formatPostDate(new Date(post.createdAt)) +'</span>\
                  </div>\
                  <p class="disqium-post-text">'+ post.raw_message +'</p>\
               </li>';
    };

    eventuallyThreads.then(function(threads) {
        $scope.find('[data-disqium-thread-id]').each(function(index , el) {
            var $el = $(el);
            var identifier = $el.data('disqium-thread-id');
            var thread = threads[identifier];
            var count = thread ? thread.posts.length : '+';
            var $button = $('<button class="disqium-toggle-thread ' + ((count == '+' || !count) ? 'empty' : '') +'">'+ (count ? count : '+') +'</button>');
            var $form = $('<form name="disqium-new-post">\
                            <input type="text" name="disqium-new-post-name" placeholder="Name" />\
                            <input type="email" name="disqium-new-post-email" placeholder="Email" />\
                            <textarea placeholder="Leave a note" name="disqium-new-post-text"></textarea>\
                            <div class="disqium-new-post-buttons">\
                              <button type="submit" class="disqium-new-post-save">Save</button>\
                            </div>\
                           </form>');
            var $posts = (function() {
                if(thread) {
                    return thread.posts.reduce(function(acc, post) {
                        return acc + renderPost(post);
                    }, '');
                } else {
                    return '';
                }
            })();
            var $panel = $('<div class="disqium-panel"></div>');
            var $discussion = $('<ul class="disqium-discussion">' + $posts + '</ul>');
            var $wrapper = $('<div class="disqium-wrapper"></div>');
            $panel.append($discussion).append($form);
            $wrapper.append($button).append($panel);
            $el.append($wrapper);
        });

        $scope.find('[data-disqium-thread-id] .disqium-toggle-thread').click(function(e) {
            e.stopPropagation();
            var $button = $(this);
            $button.toggleClass('locked');
            var $wrapper = $button.parent('.disqium-wrapper');
            $wrapper.toggleClass('fade-in');
            var $form = $wrapper.find('[name=disqium-new-post]');
            var $p = $wrapper.closest('[data-disqium-thread-id]');
            var hash = $p.attr('data-disqium-thread-id');
            var $othersWrapper = $scope.find('[data-disqium-thread-id]:not([data-disqium-thread-id='+ hash +']) .disqium-wrapper');
            if($button.is('.locked')) {
                $button.addClass('fade-in');
                $othersWrapper.addClass('hide-you');
                $scope.addClass('shift');
                onshow();
            } else {
                $othersWrapper.removeClass('hide-you');
                $scope.removeClass('shift');
                onclose();
            }
            var profile = getProfile();
            if(profile.name) $form.find('[name=disqium-new-post-name]').val(profile.name);
            if(profile.email) $form.find('[name=disqium-new-post-email]').val(profile.email);
        });

        function saveProfile(name, email) {
            window.localStorage.setItem('disqium-name', name);
            window.localStorage.setItem('disqium-email', email);
        }

        function getProfile() {
            return {
                name: window.localStorage.getItem('disqium-name'),
                email: window.localStorage.getItem('disqium-email')
            };
        }

        function onSubmit(e, $form) {
            e.preventDefault();
            e.stopPropagation();
            var $disqiumToggle = $form.parent().siblings('.disqium-toggle-thread');
            var $textarea = $form.find('[name=disqium-new-post-text]');
            var text = $textarea.val();
            var $name = $form.find('[name=disqium-new-post-name]');
            var name = $name.val();
            var $email = $form.find('[name=disqium-new-post-email]');
            var email = $email.val();
            var $submit = $form.find('.disqium-new-post-save');
            if(!$form.is('.locked') && text && name && email) {
                saveProfile(name, email);
                $form.addClass('locked');
                $textarea.attr('disabled', 'disabled');
                $name.attr('disabled', 'disabled');
                $email.attr('disabled', 'disabled');
                $submit.attr('disabled', 'disabled');
                $submit.text('Saving...');
                var $paragraph = $form.closest('[data-disqium-thread-id]');
                var identifier = $paragraph.data('disqium-thread-id');
                var createPost = function(threadId, text) {
                    return DisqusAPI.posts.create(name, email, text, threadId).then(function() {
                        var $discussion = $form.siblings('.disqium-discussion');
                        $discussion.append(renderPost({
                            author: {
                                name: name
                            },
                            raw_message: text,
                            createdAt: formatPostDate(new Date())
                        }));
                    });
                };
                function resetForm() {
                    $textarea.val('');
                    $textarea.removeAttr('disabled');
                    $name.removeAttr('disabled');
                    $email.removeAttr('disabled');
                    $submit.removeAttr('disabled');
                    $submit.text('Save');
                    $form.removeClass('locked');
                }

                function incrementPostCounter() {
                    var counter = parseInt($disqiumToggle.text().trim(), 10);
                    counter = counter ? counter : 0;
                    $disqiumToggle.removeClass('empty').text(counter+1);
                }

                DisqusAPI.threads.details(identifier).then(function(response) {
                    var threadId = response.response.id;
                    return createPost(threadId, text).then(incrementPostCounter).always(resetForm);
                }).fail(function(response) {
                    if(response.responseJSON && response.responseJSON.code === 2) {
                      var title = $paragraph.text().substring(0, 100);
                      return DisqusAPI.threads.create(title, identifier).then(function(response) {
                        var threadId = response.id;
                          return createPost(threadId, text).then(incrementPostCounter);
                      }).always(resetForm);
                    }
                });
            }
        }

        $scope.find('[data-disqium-thread-id] form[name=disqium-new-post]').submit(function(e) {
            var $form = $(this);
            onSubmit(e, $form);
        });

        $scope.find('[data-disqium-thread-id] form[name=disqium-new-post] .disqium-new-post-save').click(function(e) {
            var $form = $(this).closest('form[name=disqium-new-post]');
            onSubmit(e, $form);
        });

        $scope.find('[data-disqium-thread-id]').on('mouseenter', function() {
            var $button = $(this).find('.disqium-toggle-thread');
            if($scope.find('.disqium-toggle-thread.locked').length === 0) {
                $button.addClass('fade-in');
            }
        });

        $scope.find('[data-disqium-thread-id]').on('mouseleave', function() {
            var $button = $(this).find('.disqium-toggle-thread');
            if(!$button.is('.locked')) {
                $button.removeClass('fade-in');
            }
        });

        $scope.find('[data-disqium-thread-id] .disqium-wrapper').click(function(e) {
            e.preventDefault();
            e.stopPropagation();
        });

        $scope.find('[data-disqium-thread-id] .disqium-wrapper [name=disqium-new-post-text]').on('change cut paste drop keydown', function() {
            var textarea = this;
            window.setTimeout(function() {
                textarea.style.height = 'auto';
              textarea.style.height = (textarea.scrollHeight + 14) + 'px';
            }, 0);
        });

        $scope.find('[data-disqium-thread-id] .disqium-wrapper [name=disqium-new-post-text]').on('keydown', function(e) {
            e = e || event;
            if(e.keyCode === 13) {
                var $form = $(this).parent('form[name=disqium-new-post]');
                onSubmit(e, $form);
            }
            return true;
        });

        $(document.body).click(function() {
            var $toggle = $scope.find('.disqium-toggle-thread.locked');
            if($toggle.length) {
                $toggle.click();
                $toggle.removeClass('fade-in');
            }
        });
    });

    var handlers = {};

    function onshow() {
        var h = handlers['show'] || [];
        h.forEach(function(f) {
            f && f();
        });
    }

    function onclose() {
        var h = handlers['close'] || [];
        h.forEach(function(f) {
            f && f();
        });
    }

    return {

        on: function(event, f) {
            if(!handlers[event]) handlers[event] = [];
            handlers[event].push(f);
            return this;
        }
    };
}
