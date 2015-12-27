<!-- Prismic toolbar -->
<script type="application/javascript">
  window.prismic = {
      endpoint: '<?= prismic_endpoint() ?>'
  };
</script>
<script src="//www.google-analytics.com/cx/api.js?experiment=<?=current_experiment_id()?>"></script>
<script src="//prismic.io/snapshot/prismic.min.js"></script>

<!-- Prismic experiment -->
<?php if(current_experiment_id()) { ?>
  <script>prismic.startExperiment("<?=current_experiment_id()?>", cxApi);</script>
<?php }?>

<!-- GA -->
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-70323139-1', 'auto');
  ga('send', 'pageview');

</script>