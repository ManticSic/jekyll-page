(function() {
    var repositoryName = getRepositoryConfiguration();

    if (!repositoryName){
        removeRepositoryInfo();
        return;
    }

    $.ajax({
        url: 'https://api.github.com/repos/' + repositoryName,
    })
        .done(function(data) {
            populateRepositoryInfo(data);
        })
        .fail(function() {
            removeRepositoryInfo();
        })
    ;

    function getRepositoryConfiguration() {
        var metaElements = $('meta[name="github_repository"]');

        if (metaElements.length < 1) {
            return null;
        }

        return metaElements[0].content;
    }

    function populateRepositoryInfo(data) {
        populateRepositoryElement(data);
        populateRepositoryLicense(data);
        populateRepositoryVersion();
    }

    function removeRepositoryInfo() {
        removeRepositoryElement();
        removeRepositoryLicense();
        removeRepositoryVersion();
    }

    function populateElement(selector, data, populateFunction) {
        var elements = $(selector);

        if (elements.length < 1) {
            return;
        }

        var element = elements[0];
        populateFunction(data, element);
    }

    function populateRepositoryElement(data) {
        populateElement('li#project__repository > a', data, function(_data, _element) {
            _element.href = 'https://github.com/' + _data.full_name;
        });
    }

    function populateRepositoryLicense(data) {
        populateElement('li#project-license > span.label > span', data, function(_data, _element) {
            if (!_data.license) {
                removeRepositoryLicense();
                return;
            }

            _element.textContent = _data.license.spdx_id;
        });
    }

    function populateRepositoryVersion() {
        $.ajax({
            url: 'https://api.github.com/repos/' + repositoryName + '/releases/latest',
        })
            .done(function(data) {
                populateElement('li#project-version span.label > span', data, function (_data, _element) {
                    _element.textContent = _data.tag_name;
                });
            })
            .fail(function() {
                removeRepositoryVersion();
            })
        ;
    }

    function removeElement(selector) {
        var elements = $(selector);

        if (elements.length < 1) {
            return;
        }

        elements[0].remove();
    }

    function removeRepositoryElement() {
        removeElement('li#project__repository');
    }

    function removeRepositoryLicense() {
        removeElement('li#project-license');
    }

    function removeRepositoryVersion() {
        removeElement('li#project-version');
    }

})();
