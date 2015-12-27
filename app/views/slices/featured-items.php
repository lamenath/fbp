<div class="row-centered-aired featured-items flex-container">

  <?php foreach($slice->getValue()->getArray() as $item) { ?>

    <?php $illustration = $item->get('illustration'); ?>

    <div class="col-3 center">

      <?php $readMore = $item->get('read-more'); ?>
      <?php $readMoreLabel = $item->get('read-more-label'); ?>
      <?php $url = $readMore ? $linkResolver->resolve($readMore) : null ?>

      <a  <?= $url ? 'href="'.$url.'"' : '' ?>>
        <div class="illustration round-image" <?= $illustration ? 'style="background-image: url('.$illustration->getView("icon")->getUrl().')"' : '' ?>></div>
      </a>

      <h3><?= $item->get('title') ? $item->get('title')->asText() : ''; ?></h3>

      <?= $item->get('summary') ? $item->get('summary')->asHtml() : ''; ?>

      <?php if ($readMoreLabel): ?>

      <a class="button" <?= $url ? 'href="'.$url.'"' : '' ?>>

          <?= $readMoreLabel->asText() ?>

      </a>

      <?php endif ?>

    </div>

  <?php } ?>

</div>
